import { Types } from '@common/models';

type Action = {
  type: string;
  tuneCh: Types['Ch'];
  postsTimeline: Types['Post'][];
};

export default (state: Types['Post'][] = [], action: Action) => {
  switch (action.type) {
    case 'API_TO_SERVER[REQUEST]:changeThread':
      return [];
    case 'SERVER_TO_API[EMIT]:fetchPosts':
    case 'SERVER_TO_API[BROADCAST]:post':
      if (action.postsTimeline && action.postsTimeline.length > 0) {
        if (action.tuneCh.connection === action.postsTimeline[0].connection) {
          return [...state, ...action.postsTimeline];
        }
      }
      break;
    case 'SERVER_TO_API[EMIT]:getMore':
      if (action.postsTimeline && action.postsTimeline.length > 0) {
        return [...action.postsTimeline, ...state];
      }
      break;
  }
  return state;
};
