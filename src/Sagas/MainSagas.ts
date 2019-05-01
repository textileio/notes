import { takeLatest, fork, put, all, call, take, select, delay } from 'redux-saga/effects'
import { ActionType, getType } from 'typesafe-actions'
import MainActions, { MainSelectors, StoredNote } from '../Redux/MainRedux'
import Textile, { IAddThreadConfig, Thread, AddThreadConfig, IFilesList } from '@textile/react-native-sdk'
import { Buffer } from 'buffer'
import Config from 'react-native-config'

const { PROMISE, API_URL } = Config

const JSON_SCHEMA = {
  name: 'notes',
  pin: true,
  mill: '/blob',
  plaintext: false
}

const PUBLIC_SCHEMA = {
  name: 'public-notes',
  pin: true,
  mill: '/blob',
  plaintext: true
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield all([
    takeLatest('NODE_STARTED', nodeStarted),
    takeLatest('GET_APP_THREAD_SUCCESS', refreshNotes),
    takeLatest('SUBMIT_NOTE', submitNewNote),
    takeLatest('PUBLIC_NOTE', createPublicNote),
    takeLatest('REMOVE_NOTE', removeNote),
    // takeLatest('PUBLIC_NOTE_SUCCESS', publicNoteSuccess),
    call(uploadAllNotes)
  ])
}

function * createPrivateThread(name, key) {
  // NOTE: maybe missing toJSON param
  const schema = {
    id: '',
    json: JSON.stringify(JSON_SCHEMA),
    preset: AddThreadConfig.Schema.Preset.NONE
  }
  const config: IAddThreadConfig = {
    key,
    name,
    type: Thread.Type.PRIVATE,
    sharing: Thread.Sharing.NOT_SHARED,
    schema,
    force: false,
    members: []
  }
  const newTarget = yield call(Textile.threads.add, config)
  // pb.AddThreadConfig.Schema.create()
  // schema.json = JSON.stringify(JSON_SCHEMA)
  // const config = pb.AddThreadConfig.create()
  // config.key = key
  // config.name = name
  // config.type = pb.Thread.Type.PRIVATE
  // config.sharing = pb.Thread.Sharing.NOT_SHARED
  // config.schema = schema
  // const newTarget: pb.IThread = yield call(API.threads.add, config)
  yield put(MainActions.getThreadSuccess(newTarget))
}

function * createPublicThread(name, key) {
  const schema = {
    id: '',
    json: JSON.stringify(PUBLIC_SCHEMA),
    preset: AddThreadConfig.Schema.Preset.NONE
  }
  const config: IAddThreadConfig = {
    key,
    name,
    type: Thread.Type.OPEN,
    sharing: Thread.Sharing.NOT_SHARED,
    schema,
    force: false,
    members: []
  }

  const newTarget = yield call(Textile.threads.add, config)
  yield put(MainActions.getPublicThreadSuccess(newTarget))
}

function * getOrCreateThread() {
  const APP_THREAD_NAME = 'private_notes_blob'
  const APP_THREAD_KEY = 'textile_notes-primary-blob'

  const PUBLIC_APP_THREAD_NAME = 'public_notes_blob'
  const PUBLIC_APP_THREAD_KEY = 'textile_public_notes-primary-blob'
  try {
    const threads = yield call(Textile.threads.list)
    const target = threads.items.find((thread: Thread) => thread.key === APP_THREAD_KEY)
    if (!target) {
      yield call(createPrivateThread, APP_THREAD_NAME, APP_THREAD_KEY)
    } else {
      yield put(MainActions.getThreadSuccess(target))
    }

    const pubTarget = threads.items.find((thread: Thread) => thread.key === PUBLIC_APP_THREAD_KEY)
    if (!pubTarget) {
      yield call(createPublicThread, PUBLIC_APP_THREAD_NAME, PUBLIC_APP_THREAD_KEY)
    } else {
      yield put(MainActions.getPublicThreadSuccess(pubTarget))
    }
  } catch (err) {
    try {
      yield call(createPrivateThread, APP_THREAD_NAME, APP_THREAD_KEY)
      yield call(createPublicThread, PUBLIC_APP_THREAD_NAME, PUBLIC_APP_THREAD_KEY)
    } finally {
      // pass
    }
  }
}

export function * refreshNotes() {
  const appThread = yield select(MainSelectors.getAppThread)
  const allNotes: StoredNote[] = []
  try {
    const files: IFilesList = yield call(Textile.files.list, '', -1, appThread.id)
    for (const file of files.items) {
      const block = file.block
      for (const hash of file.files.map((ffs) => ffs.file.hash)) {
        const data = yield call(Textile.files.data, hash)
        const noteText = Buffer.from(data.split(',')[1], 'base64').toString()
        allNotes.push({
          block,
          text: noteText
        })
      }
    }
  } catch (err) {
    // console.log('files error', err.message)
  } finally {
    yield put(MainActions.setNotes(allNotes))
  }
}

export function * postNoteToThread(action: ActionType<typeof MainActions.submitNote>) {
  const appThread = yield select(MainSelectors.getAppThread)
  const input = Buffer.from(action.payload.note.trim()).toString('base64')
  const result = yield call(Textile.files.prepare, input, appThread.id)
  yield call(Textile.files.add, result.dir, appThread.id)
  yield call(refreshNotes)
}
export function * nodeStarted(action: ActionType<typeof MainActions.nodeStarted>) {
  console.info('Running nodeStarted Saga')
  yield call(getOrCreateThread)
  yield put(MainActions.uploadAllNotes())
}

export function * submitNewNote(action: ActionType<typeof MainActions.submitNote>) {
  try {
    yield call(postNoteToThread, action)
  } finally {
    yield put(MainActions.uploadAllNotes())
  }
}

export function * removeNote(action: ActionType<typeof MainActions.removeNote>) {
  const { block } = action.payload
  try {
    yield call(Textile.ignores.add, block)
  } finally {
    yield call(refreshNotes)
  }
}

export function * uploadANote(note: string) {
  const email = yield select(MainSelectors.email)
  if (!email) {
    return
  }
  const param = {
    email,
    message: note,
    promise: PROMISE
  }
  try {
    const response = yield call (fetch, API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'text/html'
      },
      body: JSON.stringify(param)
    })
    if (response.status === 200) {
      // console.info('axh', response.status)
      yield put(MainActions.uploadSuccess(note))
    } else {
      // console.info('axh', response.status)
    }
  } catch (error) {
    // console.info('axh error', error.message)
  }
}
export function * uploadAllNotes() {
  while (yield take(getType(MainActions.uploadAllNotes))) {
    try {
      const notes = yield select(MainSelectors.notes)
      for (const note of notes) {
        yield call(uploadANote, note)
      }
    } catch (error) {
      // pass
    }
  }
}

function fakeUUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable-next-line:no-bitwise
    const r = Math.random() * 16 | 0
    // tslint:disable-next-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function * createPublicNote(action: ActionType<typeof MainActions.submitNote>) {
  try {
    const publicThread = yield select(MainSelectors.getPublicThread)
    const input = Buffer.from(action.payload.note.trim()).toString('base64')
    const result = yield call(Textile.files.prepare, input, publicThread.id)

    const block = yield call(Textile.files.add, result.dir, publicThread.id)

    const files = yield call(Textile.files.list, '', -1, publicThread.id)
    const latest = files.items.length > 0 ? files.items[0] : undefined
    if (latest) {
      const file = latest.files[0].file
      if (file && file.targets.indexOf(block.target) > -1) {
        const hash = file.hash
        const url = `https://ipfs.io/ipfs/${hash}`
        yield put(MainActions.publishNoteStarting(url))
        yield call(publishPublicNote, url)
      } else {
        yield put(MainActions.publicNoteFailure())
      }
    } else {
      yield put(MainActions.publicNoteFailure())
    }
  } catch (error) {
    yield put(MainActions.publicNoteFailure())
  }
}

export function * forkFetch(url: string) {
  const response = yield call(fetch, url)
  if (response.status === 200) {
    yield put(MainActions.publicNoteSuccess())
  }
}
export function * publishPublicNote(url: string) {
  try {
    yield fork(forkFetch, url)
    yield delay(11000)
    yield put(MainActions.publicNoteSuccess())
  } catch (error) {
    yield put(MainActions.publicNoteFailure())
  }
}
