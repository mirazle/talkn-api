import { Types, inits } from '@common/models';

type Action = {
  type: string;
  chDetail: Types['ChDetail'];
};

export default (state = inits.chDetail, action: Action) => {
  return action.chDetail ? action.chDetail : state;
};
