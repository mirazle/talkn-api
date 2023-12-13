import { Middleware, Dispatch } from '@reduxjs/toolkit';
import { ReduxState } from '@api/redux/store';

type Action = {
  type: string;
  payload?: any;
};

const middleware: Middleware<{}, ReduxState, Dispatch<Action>> = (store) => (next) => (action) => {
  if (isAction(action)) {
    const state = store.getState();
    if (functions[action.type]) {
      action = functions[action.type](state, action);
    }
    next(action);
  } else {
    return next(action);
  }
};

const isAction = (action: unknown): action is Action => {
  return typeof action === 'object' && action !== null && 'type' in action;
};

const functions: { [key: string]: (state: ReduxState, action: Action) => Action } = {
  // 'ACTION_TYPE': (state, action) => { /* ... */ },
};

export default middleware;
