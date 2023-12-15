import { Types, inits } from '@common/models';
import Window from '@api/Window';

type PublicApiMethods = {
  [key: string]: Function | string;
};

// MEMO: 1インスタンスが複数のIOを持つのは違和感。1インスタンス1IOにして、ユーザーがコントロール出来るようにする。
export default class PublicApi {
  constructor(win: Window) {
    const { api, store } = win;

    const tune = (ch: string, callback?: Function) => {
      const bootOption = { ...inits.bootOption, connection: ch };
      return api('tune', bootOption, callback);
    };

    const publicApiMethods: PublicApiMethods = {
      ver: '2023/12/12',
      // on: (ch: string) => api('onResponseChAPI', ch),
      useIo: (id: string) => api('use', id),
      tune,
      untune: (id: string) => api('untune', { id }),
      fetchRank: (ch: string) => api('rank', { thread: { ch } }),
      fetchPosts: (ch: string) => api('fetchPosts', { thread: { ch } }),
      fetchChDetail: (ch: string) => api('fetchChDetail', { thread: { ch } }),
      post: (params = {}) => api('post', { tuneCh: { ...params } }),
      // getState: () => store.getState(),
    };
    return publicApiMethods;
  }
}
