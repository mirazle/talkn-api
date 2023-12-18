import WssWorker from 'worker-loader?inline=fallback&publicPath=/&filename=WssWorker.js!./wss';

import PostMessage, { MessageClientAndWsApiType, MessageParams } from '@common/PostMessage';
import { Types } from '@common/models';
import Sequence from '@common/Sequence';
import define from '@common/define';
import { generateQniqueKey } from '@common/utils';
import apiStore, { ApiStore, ReduxState } from '@api/redux/store';

const statusStop = 'stop';
const statusBooting = 'booting';
const statusTunning = 'tunning';
const statusTuned = 'tuned';
const statusConnecting = 'connecting';
type Status = typeof statusStop | typeof statusBooting | typeof statusTunning | typeof statusTuned | typeof statusConnecting;

type Options = {
  isTuneSameCh: boolean;
  isTuneMultiCh: boolean;
  isDebug: boolean;
};

const optionsInit: Options = {
  isTuneSameCh: true,
  isTuneMultiCh: true,
  isDebug: true,
};

// public.api.tsから実行される複数のwss通信をidキーで管理&reduxへのdispathを実行する
// 複数のuiからアクセス可能にするには？
export default class Manager {
  wssWorker: WssWorker;
  stores: { [id: string]: ApiStore };
  status: Status;
  options?: Options;
  callback?: Function;
  booted?: (value: Manager) => void;
  constructor() {
    this.status = statusStop;
    this.options = optionsInit;
    this.stores = {};

    this.wssWorker = new WssWorker();
    this.api = this.api.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.exePublicCallback = this.exePublicCallback.bind(this);
    this.onError = this.onError.bind(this);
  }

  public boot(options?: Options) {
    this.options = options && options;
    return new Promise((resolve) => {
      this.booted = resolve;
      this.wssWorker.onerror = this.onError;
      this.wssWorker.onmessage = this.onMessage;
      return this;
    });
  }

  public api(method: string, params: MessageParams = {}, callback?: Function): void {
    if (callback) this.callback = callback;
    this.postMessage(method, params);
  }

  private postMessage(method: string, params: MessageParams = {}): void {
    const message: MessageClientAndWsApiType = { method, params };
    this.wssWorker.postMessage(message);
  }

  private onMessage(e: MessageEvent): void {
    const { currentTarget, data } = e;
    console.log('onMessage', data);
    const { type, method, params }: MessageClientAndWsApiType = data;
    if (currentTarget instanceof Worker) {
      if (type === PostMessage.WSAPI_TO_CLIENT_TYPE) {
        const actionType = PostMessage.convertApiToClientActionType(method);
        const { ioType, exeMethod } = PostMessage.getMessageTypes(actionType);
        const state = { ...params, type: actionType };

        // callback
        this.exePublicCallback(ioType, exeMethod, state);

        if (method === 'WSS_CONSTRUCTED') {
          this.booted && this.booted(this);
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
