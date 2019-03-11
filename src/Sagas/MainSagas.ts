import { takeLatest } from 'redux-saga/effects'
import { ActionType, getType } from 'typesafe-actions'
import MainActions, { MainSelectors, Note } from '../Redux/MainRedux'
import { put, all, call, take, select } from 'redux-saga/effects'
import * as RNFS from 'react-native-fs'
import { API, pb } from '@textile/react-native-sdk'
import { Buffer } from 'buffer'
import Config from 'react-native-config'

const { PROMISE, API_URL } = Config

const JSON_SCHEMA = {
  name: 'notes',
  pin: true,
  mill: '/json',
  plaintext: true,
  json_schema: {
    title: 'TextileNotes',
    type: 'object',
    properties: {
      timestamp: {
        type: 'number',
        description: 'Epoch when the note was created.'
      },
      note: {
        type: 'string',
        description: 'The content of the note.'
      }
    }
  }
}

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* mainSagaInit() {
  yield all([
    takeLatest('NODE_STARTED', nodeStarted),
    takeLatest('GET_APP_THREAD_SUCCESS', refreshNotes),
    takeLatest('SUBMIT_NOTE', submitNewNote),
    call(uploadAllNotes)
  ])
}

function * getOrCreateThread() {
  const APP_THREAD_NAME = 'private_notes'
  const APP_THREAD_KEY = 'textile_notes-primary'
  try {
    const threads: pb.ThreadList = yield call(API.threads.list)
    const target = threads.items.find((thread: pb.IThread) => thread.key === APP_THREAD_KEY)
    if (!target) {
      throw new Error('No thread found')
    }
    yield put(MainActions.getThreadSuccess(target))
  } catch (err) {
    const schema = pb.AddThreadConfig.Schema.create()
    schema.json = JSON.stringify(JSON_SCHEMA)
    const config = pb.AddThreadConfig.create()
    config.key = APP_THREAD_KEY
    config.name = APP_THREAD_NAME
    config.type = pb.Thread.Type.PRIVATE
    config.sharing = pb.Thread.Sharing.NOT_SHARED
    config.schema = schema

    const newTarget: pb.IThread = yield call(API.threads.add, config)
    yield put(MainActions.getThreadSuccess(newTarget))
  }
}

export function * refreshNotes() {
  const appThread = yield select(MainSelectors.getAppThread)
  const allNotes: Note[] = []
  try {
    const files = yield call(API.files.list, '', -1, appThread.id)
    const hashes = files.items.map((file) => file.files.map((ffs) => ffs.file.hash))
    for (const hash of [].concat.apply([], hashes)) {
      try {
        const data = yield call(API.files.data, hash)
        const buff = Buffer.from(data.split(',')[1], 'base64')
        const json: Note = JSON.parse(buff.toString())
        allNotes.push(json)
      } catch (err) {
        // console.log('file error', err.message)
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
  const file = {
    timestamp: (new Date()).getTime(),
    note: action.payload.note.trim()
  }
  const path = RNFS.DocumentDirectoryPath + '/' + fakeUUID() + '.json'
  yield call(RNFS.writeFile, path, JSON.stringify(file), 'utf8')
  const result = yield call(API.files.prepare, path, appThread.id)
  yield call(RNFS.unlink, path)

  const dir = result.dir
  if (!dir) {
    return
  }
  yield call(API.files.add, dir, appThread.id)
  yield call(refreshNotes)
}
export function * nodeStarted(action: ActionType<typeof MainActions.nodeStarted>) {
  console.info('Running nodeStarted Saga')
  yield call(getOrCreateThread)
  yield put(MainActions.uploadAllNotes())
}

export function * submitNewNote(action: ActionType<typeof MainActions.submitNote>) {
  console.info('Running newNodeState Saga')
  try {
    yield call(postNoteToThread, action)
  } finally {
    // TODO: Add Note to Textile
    yield put(MainActions.uploadAllNotes())
  }
}

export function * uploadANote(note: string) {
  const email = yield select(MainSelectors.email)
  const param = {
    email,
    message: note,
    promise: PROMISE
  }
  const response = yield call (fetch, API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'text/html'
    },
    body: JSON.stringify(param)
  })
  if (response.status === 200) {
    yield put(MainActions.uploadSuccess(note))
  } else {
    console.info('axh', response.status)
  }
}
export function * uploadAllNotes() {
  while (yield take(getType(MainActions.uploadAllNotes))) {
    try {
      const notes = yield select(MainSelectors.notes)
      for (const note of notes) {
        // TODO: email note
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
