import { takeLatest, fork, put, all, call, take, select, delay } from 'redux-saga/effects'
import { ActionType, getType } from 'typesafe-actions'
import MainActions, { MainSelectors, UINote, NoteSchema, ThreadNote } from '../Redux/MainRedux'
import Textile, { IAddThreadConfig, Thread, AddThreadConfig, IFilesList, ThreadList, IThread, FilesList } from '@textile/react-native-sdk'
import { Buffer } from 'buffer'
import Config from 'react-native-config'
import { findExistingThread, addToThread, uuidv4 } from './MainSagas'

export function * runPendingMigration() {
  try {
    const migrationKey = yield select(MainSelectors.getMigrations)
    if (!migrationKey) {
      return
    }
    const appThread = yield select(MainSelectors.getAppThread)
    if (!appThread) {
      return
    }
    // todo abort
    const oldThread = yield call(findExistingThread, migrationKey)
    if (!oldThread) {
      return
    }
    const pageSize = 1000
    const files: FilesList = yield call(Textile.files.list, oldThread.id, '', pageSize)
    if (files.items.length === 0) {
      yield put(MainActions.migrationSuccess())
      return
    }
    for (const file of files.items) {
      for (const hash of file.files.map((ffs) => ffs.file.hash)) {
        const data = yield call(Textile.files.content, hash)
        const noteText = Buffer.from(data.split(',')[1], 'base64').toString()
        const created: number = file.date.seconds as number
        const updated: number = file.date.seconds as number
        const newNote: ThreadNote = {
          key: uuidv4(),
          text: noteText,
          value: {},
          created,
          updated
        }
        try {
          yield call(addToThread, newNote, appThread.id)
          yield call(Textile.ignores.add, file.block) // ensures it doesn't get migrated if we restart
        } catch (error) {
          // ignore for now
          console.error(error)
        }
      }
    }
    yield call(Textile.threads.remove, oldThread.id)
    yield put(MainActions.migrationSuccess())
  } catch (error) {
    // pass for now
    console.error(error)
  }
}
