import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { persistStore, persistReducer } from 'redux-persist'
import persistConfig from './ReduxPersist'

import rootReducer from './RootReducer'
import rootSaga from '../Sagas/'

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default () => {

  const sagaMiddleware = createSagaMiddleware()

  const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware))

  const persistor = persistStore(store, undefined, undefined)

  sagaMiddleware.run(rootSaga, store.dispatch)

  return { store, persistor }
}
