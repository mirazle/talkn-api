import { StoresDispatcher } from '@api/wssWorker/StoresDispatcher';

export type PublicApiMethods = {
  [key: string]: Function | string | string[];
};

export type PublicApiMethodKeys = keyof PublicApiMethods;

// MEMO: 1インスタンスが複数のIOを持つのは違和感。1インスタンス1IOにして、ユーザーがコントロール出来るようにする。
export default class PublicApi {
  constructor(storesDispatcher: StoresDispatcher) {
    const { getPids, tune, untune, fetchRank, fetchPosts, fetchChDetail, post, getState } = storesDispatcher;

    const publicApiMethods: PublicApiMethods = {
      ver: '2023/12/12',
      getPids,
      tune,
      untune,
      fetchRank,
      fetchPosts,
      fetchChDetail,
      post,
      // use: (id: string) => api('use', id),
      getState,
    };
    return publicApiMethods;
  }
}
