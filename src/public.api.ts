import { StoresDispatcher } from '@api/wssWorker/StoresDispatcher';

export type PublicApiMethods = {
  ver: string;
  getTuneIds: Function;
  tune: Function;
  untune: Function;
  fetchRank: Function;
  fetchPosts: Function;
  fetchDetail: Function;
  post: Function;
  getState: Function;
  onStates: Function;
};

export type PublicApiMethodKeys = keyof PublicApiMethods;

// MEMO: 1インスタンスが複数のIOを持つのは違和感。1インスタンス1IOにして、ユーザーがコントロール出来るようにする。
export default class PublicApi {
  constructor(storesDispatcher: StoresDispatcher) {
    const { getTuneIds, tune, untune, fetchRank, fetchPosts, fetchDetail, post, getState, onStates } = storesDispatcher;

    const publicApiMethods: PublicApiMethods = {
      ver: '2023/12/12',
      getTuneIds,
      tune,
      untune,
      fetchRank,
      fetchPosts,
      fetchDetail,
      post,
      // use: (id: string) => api('use', id),
      getState,
      onStates,
    };
    return publicApiMethods;
  }
}
