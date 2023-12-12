import { Types } from '@common/models';
import { isValidKey } from '@common/utils';

type Action = {
  type: string;
  tuneCh: Types['Ch'];
};

export default (state: { [key: string]: Types['Ch'] } = {}, action: Action) => {
  if (action.tuneCh) {
    if (!isValidKey(action.tuneCh.connection, state)) {
      return { ...state, [action.tuneCh.connection]: action.tuneCh };
    }
  }
  return state;
};
