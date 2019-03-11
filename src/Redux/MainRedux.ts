import { createAction, ActionType, getType } from 'typesafe-actions'
import { NodeState, pb } from '@textile/react-native-sdk'
import { RootState } from './Types'

const actions = {
  nodeStarted: createAction('NODE_STARTED'),
  newNodeState: createAction('NEW_NODE_STATE', (resolve) => {
    return (nodeState: NodeState) => resolve({ nodeState })
  }),
  submitNote: createAction('SUBMIT_NOTE', (resolve) => {
    return (note: string) => resolve({ note })
  }),
  uploadSuccess: createAction('SUBMIT_SUCCESS', (resolve) => {
    return (note: string) => resolve({ note })
  }),
  setNotes: createAction('SET_NOTES', (resolve) => {
    return (notes: Note[]) => resolve({ notes })
  }),
  uploadAllNotes: createAction('UPLOAD_ALL_NOTES'),
  getThreadSuccess: createAction('GET_APP_THREAD_SUCCESS', (resolve) => {
    return (appThread: pb.IThread) => resolve({ appThread })
  }),
  setEmail: createAction('SET_EMAIL', (resolve) => {
    return (email: string) => resolve({ email })
  })
}

export type MainActions = ActionType<typeof actions>

export interface Note {
  note: string
  timestamp: number
}

export interface MainState {
  appThread?: pb.IThread
  nodeState: NodeState
  storedNotes: Note[]
  notes: string[]
  email?: string
}

const initialState: MainState = {
  nodeState: NodeState.nonexistent,
  notes: [],
  storedNotes: []
}

export function reducer(state = initialState, action: MainActions) {
  switch (action.type) {
    case getType(actions.newNodeState): {
      return { ...state, nodeState: action.payload.nodeState }
    }
    case getType(actions.setEmail): {
      return { ...state, email: action.payload.email }
    }
    case getType(actions.setNotes): {
      return { ...state, storedNotes: action.payload.notes }
    }
    case getType(actions.submitNote): {
      return { ...state, notes: [action.payload.note, ...state.notes] }
    }
    case getType(actions.uploadSuccess): {
      return { ...state, notes: state.notes.filter((note) => note !== action.payload.note) }
    }
    case getType(actions.getThreadSuccess):
      return { ...state, appThread: action.payload.appThread }
    default:
      return state
  }
}

export const MainSelectors = {
  nodeState: (state: RootState) => state.main.nodeState,
  getAppThread: (state: RootState) => state.main.appThread,
  notes: (state: RootState) => state.main.notes,
  email: (state: RootState) => state.main.email
}
export default actions
