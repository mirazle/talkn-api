import WssWorker from 'worker-loader?inline=fallback&publicPath=/&filename=WssWorker.js!./wss/worker';

import PostMessage, { MessageClientAndWsApiType, MessageParams } from '@common/PostMessage';
import { Types } from '@common/models';
import Sequence from '@common/Sequence';
import define from '@common/define';
import { generateQniqueKey } from '@common/utils';
import apiStore from '@api/redux/store';

export default class Window {
  id: string;
  bootOption: Types['BootOption'];
  wsApi: WssWorker;
  store = apiStore;
  parentHref: string = location.href;
  callback: Function | undefined;
  conned?: (value: Window) => void;
  static get SET_CALLBACK_METHOD() {
    return 'tune';
  }
  constructor() {
    this.id = `${define.APP_TYPES.API}_${generateQniqueKey()}`;
    this.bootOption = { id: this.id, type: define.APP_TYPES.API } as Types['BootOption'];
    this.wsApi = new WssWorker();
    this.store.dispatch({ bootOption: this.bootOption, type: 'INIT_CLIENT' });

    this.api = this.api.bind(this);
    this.injectStateToApp = this.injectStateToApp.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.exePublicCallback = this.exePublicCallback.bind(this);
    this.onError = this.onError.bind(this);
  }

  public boot() {
    return new Promise((resolve) => {
      this.conned = resolve;
      this.wsApi.onerror = this.onError;
      this.wsApi.onmessage = this.onMessage;
      return this;
    });
  }

  public api(method: string, params: MessageParams = {}, callback?: Function): void {
    if (method === Window.SET_CALLBACK_METHOD && callback) this.callback = callback;
    this.postMessage(method, params);
  }

  private injectStateToApp(apiState: MessageParams): void {
    this.api('fetchPosts', apiState);
    this.api('rank', apiState);
  }

  private postMessage(method: string, params: MessageParams = {}): void {
    const message: MessageClientAndWsApiType = {
      // @ts-ignore
      id: params.id ? params.id : this.id,
      type: PostMessage.CLIENT_TO_WSAPI_TYPE,
      ioType: Sequence.API_SETUP,
      method,
      params,
    };
    this.wsApi.postMessage(message);
  }

  private onMessage(e: MessageEvent): void {
    const { currentTarget, data } = e;
    const { type, method, params }: MessageClientAndWsApiType = data;
    if (currentTarget instanceof Worker) {
      if (type === PostMessage.WSAPI_TO_CLIENT_TYPE) {
        const actionType = PostMessage.convertApiToClientActionType(method);
        const { ioType, exeMethod } = PostMessage.getMessageTypes(actionType);
        const state = { ...params, type: actionType };

        // callback
        this.exePublicCallback(ioType, exeMethod, state);

        if (method === 'WS_CONSTRUCTED') {
          this.conned && this.conned(this);
          if (this.id === define.APP_TYPES.CLIENT) {
            // @ts-ignore
            const backParams = params.ch ? { ...this.bootOption, ch: params.ch } : this.bootOption;
            this.api('tune', backParams);
          }
        }
        // finnish handle ws api.
        if (this.id === define.APP_TYPES.PORTAL || this.id === define.APP_TYPES.EXTENSION) {
          if (method === `SERVER_TO_API[EMIT]:tune`) {
            this.injectStateToApp(params as MessageParams);
          }
        }
      }
    }
  }

  private onError(e: ErrorEvent): void {
    console.warn(e);
  }

  private exePublicCallback(ioType: string, exeMethod: string, state: any): void {
    if (this.callback) {
      if (ioType === Sequence.API_RESPONSE_TYPE_EMIT || ioType === Sequence.API_RESPONSE_TYPE_BROADCAST) {
        this.callback(ioType, exeMethod, state);
      }
    }
  }
}
