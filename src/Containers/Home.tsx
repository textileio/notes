import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { KeyboardAvoidingView, View, Text, TextInput, TouchableOpacity, FlatList, Keyboard, Dimensions, Alert, Linking, Image, Platform } from 'react-native'
import { RootAction, RootState } from '../Redux/Types'
import Drawer from 'react-native-drawer'
import RNShake from 'react-native-shake'
import SwipeScroll from './Swipe'
import styles from './Styles'
import MainActions, { StoredNote } from '../Redux/MainRedux'

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

  componentWillMount() {
    RNShake.addEventListener('ShakeEvent', () => {
      if (this.state.note !== '') {
        Alert.alert(
          'Create disappearing IPFS note',
          'Cannot be undone.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {text: 'Confirm', onPress: () => {
              this.props.publicNote(this.state.note)
            }}
          ],
          {cancelable: true}
        )
      }
    })
  }

  componentWillUnmount() {
    RNShake.removeEventListener('ShakeEvent')
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
  keyExtractor = (item: StoredNote, index: number) => String(index)
  renderNote = (row) => {
    const { item, index } = row
    // todo: indicate which are not sent yet
    try {
      return (
        <TouchableOpacity
          style={styles.note}
          onPress={this.setNoteText(item.text)}
          onLongPress={this.removeNote(index, item)}
        >
          <Text style={styles.noteText}>{item.text}</Text>
        </TouchableOpacity>
      )
    } catch (error) {
      return (<View/>)
    }
  }

  removeNote = (index: number, note: StoredNote) => {
    return () => {
      this.props.removeNote(note.block)
    }
  }

  setNoteText = (text: string) => {
    return () => {
      console.log(text)
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
          data={this.props.threadNotes}
          keyExtractor={this.keyExtractor}
          /* tslint:disable-next-line */
          renderItem={this.renderNote}
          numColumns={1}
          initialNumToRender={50}
          onEndReachedThreshold={0.55}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          alwaysBounceHorizontal={false}
          directionalLockEnabled={false}
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
            dataDetectorTypes={'all'}
          />
          <TouchableOpacity
            disabled={!enabled}
            activeOpacity={1}
            onPress={this.saveEmail()}
          >
            <Text style={[styles.submit, enabled && styles.enabled]}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.poweredBy} />
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
    return () => {
      if (this.state.note !== '') {
        this.props.submitNote(this.state.note)
        this.setState({note: ''})
      }
    }
  }

  render() {
    const textInputHeight = Dimensions.get('window').height * 0.35
    const swipeConfig = {
      velocityThreshold: 0.1,
      directionalOffsetThreshold: 10
    }
    return (
      <KeyboardAvoidingView
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
              style={{... styles.scrollView, paddingTop: Platform.OS === 'android' ? 20 : 80}}
              onTouchEnd={this.focusNote}
              onSwipeUp={this.onSwipeUp()}
              config={swipeConfig}
            >
              {/*
              // @ts-ignore */}
              <TextInput
                ref={(ref) => this._noteInput = ref}
                style={[styles.textArea, {maxHeight: textInputHeight}]}
                onChangeText={this.setNote()}
                value={this.state.note}
                editable={true}
                autoFocus={this.props.email !== undefined}
                multiline={true}
                maxLength={2000}
                placeholder={this.props.previewText}
                returnKeyType={'next'}
                textAlignVertical={'top'}
              />
            </SwipeScroll>
            <View style={{flex: 0.25,  backgroundColor: 'white'}}/>
          </View>
        </Drawer>
        {!this.props.publishingNote && this.props.publicNoteUrl && this.renderNoteLink()}
        {this.props.publishingNote && this.renderNoteLoading()}
      </KeyboardAvoidingView>
    )
  }

  renderNoteLink = () => {
    return (
      <TouchableOpacity
        style={styles.publicLink}
        onPress={this.openPublicLink}
      >
        <Text style={{color: '#2935ff', fontSize: 30, fontWeight: '900'}}>✓</Text>
      </TouchableOpacity>
    )
  }
  renderNoteLoading = () => {
    return (
      <View
        style={styles.publicLink}
      >
        <Image source={require('../static/loading.gif')} style={{width: 75, height: 75}}/>
      </View>
    )
  }
  openPublicLink = () => {
    if (this.props.publicNoteUrl !== undefined) {
      this.props.clearPublicNote()
      Linking.openURL(this.props.publicNoteUrl)
    }
  }
}

interface StateProps {
  previewText: string
  threadNotes: ReadonlyArray<StoredNote>
  email?: string
  publicNoteUrl?: string
  publishingNote?: boolean
}

const mapStateToProps = (state: RootState): StateProps => {
  const onboardingText = Platform.OS === 'android' ?
    '\n\n\nswipe ^ up ^ saves ^ to ^ inbox\n\n>>>> drag out shows old notes' :
    '\n\n\nswipe ^ up ^ saves ^ to ^ inbox\n\n~~shake~~stores~~on~~ipfs~~\n\n>>>> drag out shows old notes'
  return {
    previewText: state.main.onboarding ? onboardingText : '',
    email: state.main.email,
    threadNotes: state.main.threadNotes,
    publicNoteUrl: state.main.publicNoteUrl,
    publishingNote: state.main.publishingNote
  }
}

interface DispatchProps {
  removeNote: (block: string) => void
  publicNote: (note: string) => void
  submitNote: (note: string) => void
  setEmail: (email: string) => void
  clearPublicNote: () => void
}

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
  return {
    removeNote: (block: string) => { dispatch(MainActions.removeNote(block)) },
    publicNote: (note: string) => { dispatch(MainActions.publicNote(note)) },
    submitNote: (note: string) => { dispatch(MainActions.submitNote(note)) },
    setEmail: (email: string) => { dispatch(MainActions.setEmail(email)) },
    clearPublicNote: () => { dispatch(MainActions.publicNoteComplete()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
