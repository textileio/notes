import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { ScrollView, View, Text, TextInput, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity, FlatList, Keyboard, Dimensions } from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import Drawer from 'react-native-drawer'
import Hyperlink from 'react-native-hyperlink'
// import GestureRecognizer from 'react-native-swipe-gestures'
import SwipeScroll from './Swipe'
import styles from './Styles'
import { NodeState } from '@textile/react-native-sdk'
import MainActions, { Note } from '../Redux/MainRedux'

interface ScreenState {
  note: string
  inputEmail: ''
  open: boolean
}

type Props = StateProps & DispatchProps

class Home extends Component<Props> {
  _drawer: any
  _noteInput: any
  _scrollView: any
  state: ScreenState = {
    note: '',
    open: true,
    inputEmail: ''
  }

  setNote = () => {
    return (note: string) => {
      this.setState({note})
    }
  }

  setEmail = () => {
    return (inputEmail: string) => {
      this.setState({inputEmail})
    }
  }

  componentDidMount() {
    if (!this.props.email) {
      this._drawer.open()
      this.setState({ open: true })
    } else {
      this._noteInput.focus()
    }
  }

  saveEmail = () => {
    return () => {
      const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      const enabled = reg.test(this.state.inputEmail)
      if (!enabled) {
        return
      }
      this.props.setEmail(this.state.inputEmail)
      this.setState({ open: false })
      this._drawer.close()
      this._noteInput.focus()
    }
  }

  drawerContent = () => {
    if (this.props.email === undefined) {
      return this.emailEntryForm()
    }
    return this.notesHistory()
  }
  keyExtractor = (item: Note, index: number) => String(index)
  renderNote = ({item}) => {
    // todo: indicate which are not sent yet
    // const display = item.timestamp === -1 ? `${item.note}` : item.note
    return (
      <TouchableOpacity
        style={styles.note}
        onPress={this.setNoteText(item.note)}
      >
        <Text style={styles.noteText}>{item.note}</Text>
      </TouchableOpacity>
    )
  }

  setNoteText = (text: string) => {
    return () => {
      const keep = this.state.note === '' ? '' : `${this.state.note}\n`
      this.setState({
        note: `${keep}${text}`
      })
      this._drawer.close()
    }
  }

  notesHistory = () => {
    return (
      <View style={styles.notesBox}>
        <FlatList
          data={this.props.storedNotes}
          keyExtractor={this.keyExtractor}
          /* tslint:disable-next-line */
          renderItem={this.renderNote.bind(this)}
          numColumns={1}
          initialNumToRender={50}
          onEndReachedThreshold={0.55}
        />

      </View>
    )
  }

  emailEntryForm = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const enabled = reg.test(this.state.inputEmail)
    return (
      <View style={styles.animatedBox}>
        <View style={styles.form}>
          <Text style={styles.instructions}>Take a note. Swipe up. Get the note in your inbox.</Text>
          <Text style={styles.emailLabel}>Your Email:</Text>
          <TextInput
            style={styles.emailInput}
            onChangeText={this.setEmail()}
            value={this.state.inputEmail}
            editable={true}
            autoFocus={true}
            blurOnSubmit={true}
            autoCapitalize={'none'}
            keyboardType={'email-address'}
          />
          <TouchableOpacity
            disabled={!enabled}
            activeOpacity={1}
            onPress={this.saveEmail()}
          >
            <Text style={[styles.submit, enabled && styles.enabled]}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.poweredBy}>
          <Text style={styles.credit}>textile.io</Text>
        </View>
      </View>
    )
  }

  onDrawerOpen = () => {
    if (!this.props.email) {
      return
    }
    Keyboard.dismiss()
  }
  focusNote = () => {
    this._noteInput.focus()
  }

  onSwipeUp = () => {
    if (this.state.note !== '') {
      this.props.submitNote(this.state.note)
      this.setState({note: ''})
    }
  }

  render() {
    const textInputHeight = Dimensions.get('window').height * 0.35
    const swipeConfig = {
      velocityThreshold: 0.1,
      directionalOffsetThreshold: 50
    }
    return (
      <View
        style={styles.container}
      >
        <Drawer
          type='overlay'
          content={this.drawerContent()}
          ref={(ref) => this._drawer = ref}
          openDrawerOffset={0.2} // 20% gap on the right side of drawer
          panCloseMask={0.2}
          panOpenMask={0.2}
          useInteractionManager={this.props.email !== undefined}
          closedDrawerOffset={-3}
          captureGestures={this.props.email !== undefined}
          negotiatePan={this.props.email !== undefined}
          tapToClose={this.props.email !== undefined}
          styles={styles.animatedBox}
          onOpen={this.onDrawerOpen}
          onClose={this.focusNote}
        >
          <View
            style={{flex: 1,  backgroundColor: 'white'}}
          >
            <SwipeScroll
              style={styles.scrollView}
              onTouchEnd={this.focusNote}
              onSwipeUp={this.onSwipeUp}
              config={swipeConfig}
            >
              <TextInput
                ref={(ref) => this._noteInput = ref}
                style={[styles.textArea, {maxHeight: textInputHeight}]}
                onChangeText={this.setNote()}
                value={this.state.note}
                editable={true}
                autoFocus={true}
                multiline={true}
                maxLength={2000}
                returnKeyType='next'
              />
            </SwipeScroll>
            <View style={{flex: 1,  backgroundColor: 'white'}}/>
          </View>
        </Drawer>
      </View>
    )
  }
}

interface StateProps {
  nodeState: NodeState
  storedNotes: Note[]
  email?: string
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    nodeState: state.main.nodeState,
    email: state.main.email,
    storedNotes: state.main.storedNotes
  }
}

interface DispatchProps {
  submitNote: (note: string) => void
  setEmail: (email: string) => void
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
  return {
    submitNote: (note: string) => { dispatch(MainActions.submitNote(note)) },
    setEmail: (email: string) => { dispatch(MainActions.setEmail(email)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
