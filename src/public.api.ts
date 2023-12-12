import Window from './Window';
import { Types } from '@common/models';

export type PublicApiMethodsType = {
  [key: string]: Function | string;
};

export class PublicApi {
  constructor(_win: Window) {
    const { api, store } = _win;
    const publicApiMethods: PublicApiMethodsType = {
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
