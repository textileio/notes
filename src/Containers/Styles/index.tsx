import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  ImageStyle
} from 'react-native'

import { material, materialColors, systemWeights } from 'react-native-typography'

interface Style {
  applicationView: ViewStyle
  textArea: TextStyle
  container: ViewStyle
  scrollView: ViewStyle
  title: TextStyle
  imageView: ViewStyle
  animatedBox: ViewStyle
  form: ViewStyle
  emailInput: TextStyle
  emailLabel: TextStyle
  instructions: TextStyle
  submit: TextStyle
  enabled: TextStyle
  poweredBy: ViewStyle
  credit: TextStyle
  notesBox: ViewStyle
  note: ViewStyle
  noteText: TextStyle
}

const styles = StyleSheet.create<Style>({
  applicationView: {
    flex: 1
  },
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white'
  },
  textArea: {
    // flex: 1,
    ...systemWeights.regular,
    // color: 'black',
    color: '#2b2b2b',
    fontSize: 18
  },
  title: {
    ...systemWeights.regular,
    color: 'black',
    fontSize: 16
  },
  imageView: {
    flex: 1,
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  animatedBox: {
    flex: 1,
    backgroundColor: '#2935ff',
    paddingHorizontal: 30,
    paddingVertical: 80,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  form: {
    flex: 1,
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start'
  },
  emailLabel: {
    ...systemWeights.bold,
    fontSize: 12,
    color: 'white',
    marginBottom: 2
  },
  emailInput: {
    ...systemWeights.bold,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: 16,
    width: 200,
    paddingVertical: 10
  },
  instructions: {
    ...systemWeights.thin,
    fontSize: 14,
    color: 'white',
    marginVertical: 40
  },
  submit: {
    ...systemWeights.thin,
    fontSize: 20,
    marginVertical: 40,
    color: 'white'
  },
  enabled: {
    ...systemWeights.bold
  },
  poweredBy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center'
  },
  credit: {
    ...systemWeights.thin,
    fontSize: 8,
    color: 'white'
  },
  notesBox: {
    flex: 1,
    backgroundColor: '#EEE',
    paddingHorizontal: 30,
    paddingVertical: 80,
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column'
  },
  note: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start'
  },
  noteText: {
    ...systemWeights.regular,
    fontSize: 14,
    color: '#2b2b2b'
  }
})

export default styles
