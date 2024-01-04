import { Types } from '@common/models';
import { ReduxState } from '@api/redux/store';

export default class ApiState {
  bootOption: Types['BootOption'];
  ranks: Types['Rank'][];
  tuneCh: Types['Ch'];
  chDetail: Types['ChDetail'];
  posts: Types['Post'][];
  postsTimeline: Types['Post'][];
  postsTimelineStock: Types['Post'][];
  // tunedChs: { [key: string]: Types['Ch'] };
  logs: string[];
  constructor(reduxState: Partial<ReduxState> = {}) {
    this.bootOption = reduxState?.bootOption || (reduxState?.bootOption as Types['BootOption']);
    this.ranks = reduxState?.ranks || [];
    this.tuneCh = reduxState?.tuneCh || (reduxState?.tuneCh as Types['Ch']);
    this.chDetail = reduxState?.chDetail || (reduxState?.chDetail as Types['ChDetail']);
    this.posts = reduxState?.posts || [];
    this.postsTimeline = reduxState?.postsTimeline || [];
    this.postsTimelineStock = reduxState?.postsTimelineStock || [];
    // this.tunedChs = reduxState?.tunedChs || {};
    this.logs = [];
  }
}
