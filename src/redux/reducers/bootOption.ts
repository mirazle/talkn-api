import { Types, inits } from '@common/models';

type Action = {
  type: string;
  bootOption: Types['BootOption'];
};

export default (state = inits.bootOption, action: Action) => {
  return action.bootOption ? action.bootOption : state;
};
