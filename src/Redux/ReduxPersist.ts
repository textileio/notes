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
  2: (persistedState) => {
    const state = persistedState as any
    return {
      ...state,
      main: {
        ...state.main,
        threadNotes: [],
        migrations: 'private_notes_blob',
        appThreadMeta: {
          name: 'private_notes_blob',
          key: 'io.textile.notes_desktop_primary_v1',
          schema: {
            name: 'io.textile.notes_primary_v0.0.1',
            mill: '/json',
            json_schema: {
              definitions: {},
              type: 'object',
              title: '',
              required: ['key', 'text', 'value', 'updated', 'created'],
              properties: {
                key: {
                  type: 'string'
                },
                text: {
                  type: 'string'
                },
                value: {
                  type: 'object'
                },
                updated: {
                  type: 'integer'
                },
                created: {
                  type: 'integer'
                }
              }
            }
          }
        }
      }
    }
  }
}

const persistConfig: PersistConfig = {
  key: 'primary',
  storage: AsyncStorage,
  version: 2,
  migrate: createMigrate(migrations, { debug: true })
}

export default persistConfig
