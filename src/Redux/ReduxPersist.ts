import { AsyncStorage } from 'react-native'
import { createMigrate, PersistConfig, MigrationManifest } from 'redux-persist'

const migrations: MigrationManifest = {
  0: (persistedState) => {
    const state = persistedState as any
    return state
  },
  1: (persistedState) => {
    const state = persistedState as any
    return {
      ...state,
      main: {
        ...state.main,
        appThreadMeta: {
          name: 'private_notes_blob',
          key: 'textile_notes-primary-blob',
          schema: {
            name: 'notes',
            pin: true,
            mill: '/blob',
            plaintext: false
          }
        },
        publicThreadMeta: {
          name: 'public_notes_blob',
          key: 'textile_public_notes-primary-blob',
          schema: {
            name: 'public-notes',
            pin: true,
            mill: '/blob',
            plaintext: true
          }
        }
      }
    }
  },
}

const persistConfig: PersistConfig = {
  key: 'primary',
  storage: AsyncStorage,
  version: 1,
  migrate: createMigrate(migrations, { debug: true })
}

export default persistConfig
