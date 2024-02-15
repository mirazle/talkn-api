import { Types, inits } from '@common/models';
import { Ch } from '@common/models/Ch';
import { ReduxState } from '@api/redux/store';

export default class ApiState {
  bootOption: Types['BootOption'];
  rank: Types['Rank'][];
  tuneCh: Types['Ch'];
  chDetail: Types['ChDetail'];
  posts: Types['Post'][];
  postsTimeline: Types['Post'][];
  postsTimelineStock: Types['Post'][];
  logs: string[];
  constructor(reduxState: Partial<ReduxState> = {}) {
    this.bootOption = reduxState.bootOption || inits.bootOption;
    this.rank = reduxState.rank || [];
    this.tuneCh = reduxState.tuneCh || inits.ch;
    this.chDetail = reduxState.chDetail || inits.chDetail;
    this.posts = reduxState.posts || [];
    this.postsTimeline = reduxState.postsTimeline || [];
    this.postsTimelineStock = reduxState.postsTimelineStock || [];
    this.logs = [];
  }
}
