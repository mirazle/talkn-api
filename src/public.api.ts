import { StoresDispatcher } from '@api/wssWorker/StoresDispatcher';

export type PublicApiMethods = {
  ver: string;
  uid: string;
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

export default class PublicApi {
  constructor(storesDispatcher: StoresDispatcher) {
    const { getTuneIds, uid, tune, untune, fetchRank, fetchPosts, fetchDetail, post, getState, onStates } = storesDispatcher;

    const publicApiMethods: PublicApiMethods = {
      ver: '2023/12/12',
      uid,
      getTuneIds,
      tune,
      untune,
      fetchRank,
      fetchPosts,
      fetchDetail,
      post,
      getState,
      onStates,
    };
    return publicApiMethods;
  }
}
