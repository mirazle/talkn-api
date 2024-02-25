import { Types, inits } from '@common/models';
import { ReduxState } from '@api/redux/store';

export default class ApiState {
  bootOption: Types['BootOption'];
  tuneCh: Types['Ch'];
  rank: Types['Rank'][];
  rankAll: Types['Rank'][];
  posts: Types['Post'][];
  postsTimeline: Types['Post'][];
  postsTimelineStock: Types['Post'][];
  chDetail: Types['ChDetail'];
  logs: string[];
  constructor(reduxState: Partial<ReduxState> = {}) {
    this.bootOption = reduxState.bootOption || inits.bootOption;
    this.tuneCh = reduxState.tuneCh || inits.ch;
    this.rank = reduxState.rank || [];
    this.rankAll = reduxState.rankAll || [];
    this.posts = reduxState.posts || [];
    this.postsTimeline = reduxState.postsTimeline || [];
    this.postsTimelineStock = reduxState.postsTimelineStock || [];
    this.chDetail = reduxState.chDetail || inits.chDetail;
    this.logs = [];
  }
}
