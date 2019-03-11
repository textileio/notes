import {
  createAppContainer,
  createSwitchNavigator
} from 'react-navigation'

import Home from '../Containers/Home'

const nav = createSwitchNavigator(
  {
    Home
  },
  {
    initialRouteName: 'Home'
  }
)

const app = createAppContainer(nav)

export default app
