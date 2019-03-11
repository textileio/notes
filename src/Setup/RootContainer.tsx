import React, { Component } from 'react'
import { View, StatusBar, Platform } from 'react-native'
import { NavigationContainerComponent } from 'react-navigation'
import Navigation from '../Navigation'
import NavigationService from '../Navigation/Service'
import styles from '../Containers/Styles'

class App extends Component<{}> {
  render () {
    const barStyle = Platform.OS === 'ios' ? 'dark-content' : 'light-content'
    return (
      <View style={styles.applicationView}>
        <StatusBar barStyle={barStyle} />
        <Navigation
          ref={(navRef: NavigationContainerComponent) => { NavigationService.setTopLevelNavigator(navRef) }}
        />
      </View>
    )
  }
}

export default App
