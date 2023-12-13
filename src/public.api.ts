import { Types } from '@common/models';
import Window from '@api/Window';

type PublicApiMethods = {
  [key: string]: Function | string;
};

// TODO: 1インスタンスが複数のIOを持つのは違和感(管理が煩雑)。1インスタンス1IOにして、ユーザーがコントロール出来るようにする
export default class PublicApi {
  constructor(_win: Window) {
    const { api, store } = _win;
    const publicApiMethods: PublicApiMethods = {
      ver: '2023/12/12',
      on: (ch: string) => api('onResponseChAPI', ch),
      useIo: (id: string) => api('use', id),
      tune: (bootOption: Types['BootOption'], callback?: Function) => api('tune', bootOption, callback),
      untune: (id: string) => api('untune', { id }),
      rank: (ch: string) => api('rank', { thread: { ch } }),
      fetchPosts: (ch: string) => api('fetchPosts', { thread: { ch } }),
      post: (params = {}) => api('post', { app: { ...params } }),
      getState: () => store.getState(),
    };
    return publicApiMethods;
  }
}
