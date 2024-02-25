import { Types } from '@common/models';

type Action = {
  type: string;
  tuneCh?: Types['Ch'];
  rank?: Types['Rank'][];
  posts?: Types['Post'][];
};

export default (state: Types['Rank'][] = [], action: Action) => {
  const { posts, rank, tuneCh } = action;
  let postsCnt = posts?.length || 0;
  let rankCnt = rank?.length || 0;

  const sortLiveCnt = (a: Types['Rank'], b: Types['Rank']) => {
    if (!tuneCh) return 0;
    if (a.connection === tuneCh.connection || b.connection === tuneCh.connection) {
      return 0;
    }
    if (a.liveCnt < b.liveCnt) return 1;
    if (a.liveCnt > b.liveCnt) return -1;
    return 0;
  };

  switch (action.type) {
    case 'SERVER_TO_API[EMIT]:fetchPosts':
      if (tuneCh && posts) {
        if (postsCnt === 0) return state;

        return state.map((rank: Types['Rank']) => {
          if (tuneCh.connection === rank.connection) {
            return {
              ...rank,
              favicon: posts[postsCnt - 1].favicon,
              stampId: posts[postsCnt - 1].stampId,
              post: posts[postsCnt - 1].content,
            };
          } else {
            return rank;
          }
        });
      }
    case 'SERVER_TO_API[BROADCAST]:tune':
    case 'SERVER_TO_API[BROADCAST]:changeThread':
    case 'SERVER_TO_API[BROADCAST]:disconnect':
      if (tuneCh) {
        return state
          .map((rank: Types['Rank']) => {
            return tuneCh.connection === rank.connection ? { ...rank, liveCnt: tuneCh.liveCnt } : rank;
          })
          .sort(sortLiveCnt);
      }
    case 'SERVER_TO_API[BROADCAST]:post':
      if (posts) {
        return state.map((rank: Types['Rank']) => {
          if (posts[0].connection === rank.connection) {
            return {
              ...rank,
              title: posts[0].title,
              stampId: posts[0].stampId,
              favicon: posts[0].favicon,
              post: posts[0].content,
            };
          }
          return rank;
        });
      }
    case 'SERVER_TO_API[EMIT]:rank':
      // stateとaction.rankの両方存在する場合
      if (state && state.length > 0 && rank && rankCnt > 0) {
        const newRanks = [];
        let lastPost = rank[0];
        for (let i = 0; i < rankCnt; i++) {
          let newRank = rank[i];
          lastPost = newRank.updateTime > lastPost.updateTime ? newRank : lastPost;

          if (newRank.connection === state[0].connection) {
            newRank = {
              ...newRank,
              liveCnt: state[0].liveCnt,
            };
          }
          newRanks.push(newRank);
        }

        newRanks.sort(sortLiveCnt);
        newRanks[0].favicon = lastPost.favicon;
        newRanks[0].content = lastPost.content;
        newRanks[0].stampId = lastPost.stampId;
        return newRanks;
      } else {
        return action.rank ? action.rank : state;
      }
    default:
      return action.rank ? action.rank : state;
  }
};
