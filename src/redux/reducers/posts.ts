import { Types } from '@common/models';

type Action = {
  type: string;
  tuneCh: Types['Ch'];
  posts: Types['Post'][];
};

export default (state: Types['Post'][] = [], action: Action) => {
  switch (action.type) {
    case 'API_TO_SERVER[REQUEST]:changeThread':
      return [];
    case 'SERVER_TO_API[EMIT]:fetchPosts':
    case 'SERVER_TO_API[BROADCAST]:post':
      if (action.posts && action.posts.length > 0) {
        if (action.tuneCh.connection === action.posts[0].connection) {
          return [...state, ...action.posts];
        }
      }
      break;
    case 'SERVER_TO_API[EMIT]:getMore':
      if (action.posts && action.posts.length > 0) {
        return [...action.posts, ...state];
      }
      break;
  }
  return state;
};
