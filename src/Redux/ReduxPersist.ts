import { AsyncStorage } from 'react-native'
import { createMigrate, PersistConfig, MigrationManifest } from 'redux-persist'

const migrations: MigrationManifest = {
  0: (persistedState) => {
    const state = persistedState as any
    return state
  }
}

const persistConfig: PersistConfig = {
  key: 'primary',
  storage: AsyncStorage,
  version: 0,
  // whitelist: ['main'],
  migrate: createMigrate(migrations, { debug: true })
}

export default persistConfig
