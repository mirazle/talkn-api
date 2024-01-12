import models, { Types, inits } from '@common/models';

type Action = {
  type: string;
  tuneCh: Types['Ch'];
};

export default (state: Types['Ch'] = inits.ch, action: Action) => {
  if (action.tuneCh) {
    if (state.tuneId === '' && action.tuneCh.tuneId) {
      return { ...action.tuneCh };
    }
    if (state.tuneId !== '' && state.tuneId === action.tuneCh.tuneId) {
      return { ...action.tuneCh };
    }
    if (state.connection === action.tuneCh.connection) {
      return { ...state, liveCnt: action.tuneCh.liveCnt };
    }
  }
  return state;
};
