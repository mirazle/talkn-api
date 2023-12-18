import { inits } from '@common/models';
import Window from '@api/Manager';

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

    const untune = (ch: string, callback?: Function) => {
      const bootOption = { ...inits.bootOption, connection: ch };
      return api('untune', bootOption, callback);
    };

    const fetchRank = (ch: string, callback?: Function) => {
      const bootOption = { ...inits.bootOption, connection: ch };
      return api('fetchRank', bootOption, callback);
    };

    const fetchPosts = (ch: string, callback?: Function) => {
      const bootOption = { ...inits.bootOption, connection: ch };
      return api('fetchPosts', bootOption, callback);
    };

    const fetchChDetail = (ch: string, callback?: Function) => {
      const bootOption = { ...inits.bootOption, connection: ch };
      return api('fetchChDetail', bootOption, callback);
    };

    const post = (ch: string, callback?: Function) => {
      const bootOption = { ...inits.bootOption, connection: ch };
      return api('post', bootOption, callback);
    };

    const publicApiMethods: PublicApiMethods = {
      ver: '2023/12/12',
      use: (id: string) => api('use', id),
      tune,
      untune,
      fetchRank,
      fetchPosts,
      fetchChDetail,
      post,
      getState: () => store.getState(),
    };
    return publicApiMethods;
  }
}
