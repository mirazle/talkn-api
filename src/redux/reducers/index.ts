import { combineReducers } from 'redux';

import logs from './logs';
import bootOption from './bootOption';
import posts from './posts';
import postsTimeline from './postsTimeline';
import postsTimelineStock from './postsTimelineStock';
import rank from './rank';
import rankAll from './rankAll';
import chDetail from './chDetail';
// import tunedChs from './tunedChs';
import tuneCh from './tuneCh';

export const reducers = {
  bootOption,
  rank,
  rankAll,
  tuneCh,
  posts,
  postsTimeline,
  postsTimelineStock,
  chDetail,
  //  tunedChs,
  logs,
};

export default combineReducers(reducers);
