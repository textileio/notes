# @textile/advanced-react-native-boilerplate

React Native boilerplate including react-navigation, redux, and sagas with example [Textile](https://github.com/textileio/go-textile/wiki) management. Built using the [Textile React Native SDK](https://github.com/textileio/react-native-sdk) and runs an [IPFS](https://ipfs.io) node directly in your app.

If you are looking for a more simple boilerplate, try our [single screen react-native boilerplate](https://github.com/textileio/react-native-boilerplate).

This project uses [Typescript](https://www.typescriptlang.org/).

The project setup was inspired by [Textile Photos](https://github.com/textileio/textile-mobile/) and was used in [AirSecure](http://github.com/airsecure/airsecure).

## How to use.

##### Clone this repo


```
git clone git@github.com:textileio/advanced-react-native-boilerplate.git
cd advanced-react-native-boilerplate
```

#### Install dependencies

We use Yarn for development and recommend [installing it](https://yarnpkg.com/lang/en/docs/install/), however, `npm` alone _might_ work.

```bash
yarn install
```

#### Run the app

```bash
react-native run-ios
```

#### Issues

Please add any issues to the [react-native-sdk repo](https://github.com/textileio/react-native-sdk).


## Adding new screens

You can add new views as React Native components in `src/Containers`. Take a look at the [Home.tsx](https://github.com/textileio/advanced-react-native-boilerplate/blob/master/src/Containers/Home.tsx) for how we've structured a basic screen, reading Textile node state information from our Redux state data.

After adding a new view, you'll want to include it in your Navigation object found at [src/Navigation/index.ts](https://github.com/textileio/advanced-react-native-boilerplate/blob/master/src/Navigation/index.ts). 

Import your new view,

```javascript
import <YourView> from '../Containers/<YourViewFile>'
```

And add it to the Navigator,


```javascript
const nav = createSwitchNavigator(
  {
    Home,
    <YourView>
  },
  {
    initialRouteName: 'Home'
  }
)
```

### Adding new state information to Redux

We've included one Redux file here, [MainRedux](https://github.com/textileio/advanced-react-native-boilerplate/blob/master/src/Redux/MainRedux.ts), but you can look at the source code for [Textile Photos](https://github.com/textileio/textile-mobile/) for more advanced Redux handling.

You can trigger a new Redux action with no state changes simply by updating MainRedux, for example,

```javascript
const actions = {
  nodeStarted: createAction('NODE_STARTED'),
  newNodeState: createAction('NEW_NODE_STATE', (resolve) => {
    return (nodeState: NodeState) => resolve({ nodeState })
  }),
  yourNewEvent: createAction('NEW_EVENT_HAPPENED')
}
```

Or, you can create an event's payload to update the Redux state with,

```javascript
const actions = {
  nodeStarted: createAction('NODE_STARTED'),
  newNodeState: createAction('NEW_NODE_STATE', (resolve) => {
    return (nodeState: NodeState) => resolve({ nodeState })
  }),
  yourNewEvent: createAction('NEW_EVENT_HAPPENED', (resolve) => {
    return (message: String) => resolve({ message })
  })
}
...
// update the redux state to store the latest message from yourNewEvent
export interface MainState {
  started: boolean
  nodeState: NodeState
  latestMessage?: string
}
// we don't need to include it in the initialState since latestMessage is an optional

...
// Add a new switch case to process the payload (message string in this case)
    ...
    case getType(actions.yourNewEvent): {
      return { ...state, latestMessage: action.payload.message }
    }
    ...
```

### Use Sagas to trigger other processes from Redux actions

You can use [MainSagas](https://github.com/textileio/advanced-react-native-boilerplate/blob/master/src/Sagas/MainSagas.ts) to attach advanced processing to new Redux actions.

Again, MainSagas is a simple example for taking each new event and passing it to a function, but look at Textile Photos for advanced redux/saga interaction.

Take every time your new event is fired and run a function,

```javascript 
// Add a new takeLatest to our sagaInit
export function* mainSagaInit() {
  yield takeLatest('NODE_STARTED', nodeStarted)
  yield takeLatest('NEW_NODE_STATE', newNodeState)
  yield takeLatest('NEW_EVENT_HAPPENED', consoleLogNewEvent)
}
...
// Create a function to execute for NEW_EVENT_HAPPENED
export function * consoleLogNewEvent(action: ActionType<typeof MainActions.yourNewEvent>) {
  const { message } = action.payload
  console.info('New event with message: ', message)
}
```
