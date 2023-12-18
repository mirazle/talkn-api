import models, { Types, inits } from '@common/models';

type Action = {
  type: string;
  tuneCh: Types['Ch'];
};

export default (state: Types['Ch'] = inits.ch, action: Action) => {
  console.log('REDUCER', action.type, action);
  return action.tuneCh ? { ...action.tuneCh } : state;
};
