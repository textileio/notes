import { takeLatest, fork, put, all, call, take, select, delay } from 'redux-saga/effects'
import { ActionType, getType } from 'typesafe-actions'
import MainActions, { MainSelectors, UINote, NoteSchema } from '../Redux/MainRedux'
import Textile, { IAddThreadConfig, Thread, AddThreadConfig, IFilesList, ThreadList, IThread } from '@textile/react-native-sdk'
import { Buffer } from 'buffer'
import Config from 'react-native-config'

const { PROMISE, API_URL } = Config

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield call(Textile.initialize, false, false)
  yield all([
    takeLatest('NODE_STARTED', nodeStarted),
    takeLatest('GET_APP_THREAD_SUCCESS', refreshNotes),
    takeLatest('SUBMIT_NOTE', submitNewNote),
    takeLatest('PUBLIC_NOTE', createPublicNote),
    takeLatest('REMOVE_NOTE', removeNote),
    call(uploadAllNotes)
  ])
}

function * getOrCreatePrivateThread() {
  // NOTE: maybe missing toJSON param
  const appMeta = yield select(MainSelectors.getAppThreadMeta)
  const targetThread = yield call(findExistingThread, appMeta.key)
  if (targetThread) {
   yield put(MainActions.getThreadSuccess(targetThread))
   return
  }

  const schema = {
    id: '',
    json: JSON.stringify(appMeta.schema),
    preset: AddThreadConfig.Schema.Preset.NONE
  }
  const config: IAddThreadConfig = {
    key: appMeta.key,
    name: appMeta.key,
    type: Thread.Type.PRIVATE,
    sharing: Thread.Sharing.NOT_SHARED,
    schema,
    force: false,
    members: []
  }
  const newTarget = yield call(Textile.threads.add, config)
  yield put(MainActions.getThreadSuccess(newTarget))
}

function * getOrCreatePublicThread() {
  const publicMeta = yield select(MainSelectors.getPublicThreadMeta)

  const targetThread = yield call(findExistingThread, publicMeta.key)
  if (targetThread) {
   yield put(MainActions.getPublicThreadSuccess(targetThread))
   return
  }

  const schema = {
    id: '',
    json: JSON.stringify(publicMeta.schema),
    preset: AddThreadConfig.Schema.Preset.NONE
  }
  const config: IAddThreadConfig = {
    key: publicMeta.key,
    name: publicMeta.name,
    type: Thread.Type.OPEN,
    sharing: Thread.Sharing.NOT_SHARED,
    schema,
    force: false,
    members: []
  }

  const newTarget = yield call(Textile.threads.add, config)
  yield put(MainActions.getPublicThreadSuccess(newTarget))
}

function * getOrCreateThreads() {
  try {
    yield call(getOrCreatePrivateThread)
    yield call(getOrCreatePublicThread)
  } catch (err) {

  }
}

export function * refreshNotes() {
  const appThread = yield select(MainSelectors.getAppThread)
  const allNotes: UINote[] = []
  try {
    const files: IFilesList = yield call(Textile.files.list, '', -1, appThread.id)
    for (const file of files.items) {
      const block = file.block
      for (const hash of file.files.map((ffs) => ffs.file.hash)) {
        const data = yield call(Textile.files.data, hash)
        const json = Buffer.from(data.split(',')[1], 'base64').toString()
        const note = JSON.parse(json)
        allNotes.push({
          block,
          stored: note
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
  const { note } = action.payload
  const { block, stored } = note
  const appThread = yield select(MainSelectors.getAppThread)
  const payload = JSON.stringify(stored)
  const input = Buffer.from(payload).toString('base64')
  // const input = Buffer.from(action.payload.note.trim()).toString('base64')
  try {
    const result = yield call(Textile.files.prepare, input, appThread.id)
    yield call(Textile.files.add, result.dir, appThread.id)
    if (block) {
      yield call(Textile.ignores.add, block)
    }
  } catch (error) {
    console.info(error)
  } finally {
    yield call(refreshNotes)
  }
}
export function * nodeStarted(action: ActionType<typeof MainActions.nodeStarted>) {
  console.info('Running nodeStarted Saga')
  yield call(getOrCreateThreads)
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
    const response = yield call(fetch, API_URL, {
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

export function * createPublicNote(action: ActionType<typeof MainActions.publicNote>) {
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

export function * findExistingThread(key: string) {
  const threads: ThreadList = yield call(Textile.threads.list)
  return threads.items.find((thread: IThread) => thread.key === key)
}