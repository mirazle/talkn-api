import models, { Types, inits } from '@common/models';

type Action = {
  type: string;
  tuneCh: Types['Ch'];
};

export default (state: Types['Ch'] = inits.ch, action: Action) => {
  return action.tuneCh ? { ...action.tuneCh } : state;
};
