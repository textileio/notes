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
  publicNote: createAction('PUBLIC_NOTE', (resolve) => {
    return (note: string) => resolve({ note })
  }),
  publishNoteStarting: createAction('PUBLISH_NOTE_STARTING', (resolve) => {
    return (url: string) => resolve({ url })
  }),
  publicNoteSuccess: createAction('PUBLIC_NOTE_SUCCESS'),
  publicNoteFailure: createAction('PUBLIC_NOTE_FAILURE'),
  publicNoteComplete: createAction('PUBLIC_NOTE_COMPLETE'),
  uploadSuccess: createAction('SUBMIT_SUCCESS', (resolve) => {
    return (note: string) => resolve({ note })
  }),
  setNotes: createAction('SET_NOTES', (resolve) => {
    return (notes: string[]) => resolve({ notes })
  }),
  uploadAllNotes: createAction('UPLOAD_ALL_NOTES'),
  getThreadSuccess: createAction('GET_APP_THREAD_SUCCESS', (resolve) => {
    return (appThread: pb.IThread) => resolve({ appThread })
  }),
  getPublicThreadSuccess: createAction('GET_PUBLIC_THREAD_SUCCESS', (resolve) => {
    return (publicThread: pb.IThread) => resolve({ publicThread })
  }),
  setEmail: createAction('SET_EMAIL', (resolve) => {
    return (email: string) => resolve({ email })
  })
}

export type MainActions = ActionType<typeof actions>

export interface MainState {
  onboarding: boolean
  appThread?: pb.IThread
  publicThread?: pb.IThread
  nodeState: NodeState
  storedNotes: string[]
  notes: string[]
  email?: string
  publicNoteUrl?: string
  publishingNote?: boolean
}

const initialState: MainState = {
  onboarding: true,
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
      return { ...state, storedNotes: action.payload.notes, publishingNote: false }
    }
    case getType(actions.publicNoteSuccess): {
      return { ...state, publishingNote: false }
    }
    case getType(actions.publishNoteStarting): {
      return { ...state, onboarding: false, publicNoteUrl: action.payload.url, publishingNote: true }
    }
    case getType(actions.publicNoteFailure): {
      return { ...state, publishingNote: false}
    }
    case getType(actions.publicNoteComplete): {
      return { ...state, publicNoteUrl: undefined, publishingNote: false }
    }
    case getType(actions.submitNote): {
      return { ...state, onboarding: false, notes: [action.payload.note, ...state.notes] }
    }
    case getType(actions.uploadSuccess): {
      return { ...state, notes: state.notes.filter((note) => note !== action.payload.note) }
    }
    case getType(actions.getThreadSuccess):
      return { ...state, appThread: action.payload.appThread }
      case getType(actions.getPublicThreadSuccess):
        return { ...state, publicThread: action.payload.publicThread }
    default:
      return state
  }
}

export const MainSelectors = {
  nodeState: (state: RootState) => state.main.nodeState,
  getAppThread: (state: RootState) => state.main.appThread,
  getPublicThread: (state: RootState) => state.main.publicThread,
  notes: (state: RootState) => state.main.notes,
  email: (state: RootState) => state.main.email,
  getPublicUrl: (state: RootState) => state.main.publicNoteUrl
}
export default actions
