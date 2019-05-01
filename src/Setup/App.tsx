import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import RootContainer from './RootContainer'
import configureStore from '../Redux/configureStore'
import MainActions from '../Redux/MainRedux'

import Textile, { EventSubscription } from '@textile/react-native-sdk'

const { store, persistor } = configureStore()

class App extends Component {
  subscriptions: EventSubscription[] = []

  render () {
    return (
      <Provider store={store}>
        <PersistGate loading={undefined} persistor={persistor}>
          <RootContainer />
        </PersistGate>
      </Provider>
    )
  }

  componentDidMount () {
    // 'started', 'stopped
    this.subscriptions.push(
      Textile.events.addNodeStartedListener(() => {
        store.dispatch(MainActions.nodeStarted())
        store.dispatch(MainActions.newNodeState('started'))
      })
    )
    this.subscriptions.push(
      Textile.events.addNodeStoppedListener(() => {
          store.dispatch(MainActions.newNodeState('stopped'))
      // Account actions
      })
    )
  }

  componentWillUnmount () {
    for (const subscription of this.subscriptions) {
      subscription.cancel()
    }
  }
}

export default App
