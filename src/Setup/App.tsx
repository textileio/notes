import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import RootContainer from './RootContainer'
import configureStore from '../Redux/configureStore'
import MainActions from '../Redux/MainRedux'

import Textile, {Events as TextileEvents} from '@textile/react-native-sdk'

const { store, persistor } = configureStore()

class App extends Component {

  textile = Textile
  events = new TextileEvents()

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
    this.events.addListener('newNodeState', (payload) => {
      if (payload.state === 'started') {
        // Redundant to newNodeState, but just for example purposes
        store.dispatch(MainActions.nodeStarted())
      }
      store.dispatch(MainActions.newNodeState(payload.state))
      console.info('@textile/newNodeState', payload.state)
    })
    this.textile.setup({
      MINIMUM_SLEEP_MINUTES: 10,
      RUN_BACKGROUND_TASK: () => false
    })
  }

  componentWillUnmount () {
    this.textile.tearDown()
  }
}

export default App
