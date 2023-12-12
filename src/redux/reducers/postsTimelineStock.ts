import { Types } from '@common/models';

type Action = {
  type: string;
  tuneCh: Types['Ch'];
  postsTimelineStock: Types['Post'][];
};

export default (state: Types['Post'][] = [], action: Action) => {
  switch (action.type) {
    case 'API_TO_SERVER[REQUEST]:changeThread':
      return [];
    case 'SERVER_TO_API[EMIT]:fetchPosts':
    case 'SERVER_TO_API[BROADCAST]:post':
      if (action.postsTimelineStock && action.postsTimelineStock.length > 0) {
        if (action.tuneCh.connection === action.postsTimelineStock[0].connection) {
          return [...state, ...action.postsTimelineStock];
        }
      }
      break;
    case 'SERVER_TO_API[EMIT]:getMore':
      if (action.postsTimelineStock && action.postsTimelineStock.length > 0) {
        return [...action.postsTimelineStock, ...state];
      }
      break;
  }
  return state;
};
