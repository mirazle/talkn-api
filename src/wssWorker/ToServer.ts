import io, { Socket } from 'socket.io-client';

import { Types } from '@common/models';
import Sequence from '@common/Sequence';
import conf from '@common/conf';
import define from '@common/define';
import { isValidKey } from '@common/utils';

import WsClientToApiRequestActions from '@api/redux/actions/apiToServerRequest';

import WssWorker, { statusTuned, statusTunning } from '.';

type SocketCustom = Socket & { _callbacks: { [key: string]: Function } };

// 複数のioのリクエストとレスポンスを受け取るのに専念する
export default class ToServer {
  id: string;
  ios: { [id: string]: SocketCustom };
  methods: { [key: string]: Function };
  wssWorker: WssWorker;
  static get domain() {
    return conf.env === define.DEVELOPMENT || conf.env === define.LOCALHOST ? define.DEVELOPMENT_DOMAIN : define.PRODUCTION_DOMAIN;
  }
  static get option() {
    return { forceNew: true };
  }
  constructor(wssWorker: WssWorker) {
    this.tune = this.tune.bind(this);
    this.untune = this.untune.bind(this);
    this.exe = this.exe.bind(this);
    this.onResponseEmit = this.onResponseEmit.bind(this);
    this.onResponseBoardcast = this.onResponseBoardcast.bind(this);
    this.offResponse = this.offResponse.bind(this);

    this.id = '';
    this.ios = {};
    this.methods = {};
    this.wssWorker = wssWorker;
  }

  // change io connection.
  public setId(id: string): void {
    if (id && id !== this.id) {
      if (isValidKey(id, this.ios)) {
        this.ios[id]['disconnect']();
        delete this.ios[id];
      }
      this.id = id;
    }
  }

  public exe(id: string, method: string, params: any): void {
    if (isValidKey(method, this) && typeof this[method] === 'function') {
      (this as any)[method](id, params);
    }

    if (isValidKey(method, this.methods) && typeof this.methods[method] === 'function') {
      (this.methods as any)[method](id, params);
    }
  }

  private onResponseEmit(uid: string, connection: string) {
    if (!this.ios[uid]._callbacks[connection]) {
      this.ios[uid].on(Sequence.EMIT_ME_KEY, (response: any) => {
        this.wssWorker.postMessage({ uid, method: response.type, params: response });
      });
    }
  }

  private onResponseBoardcast(uid: string, connection: string) {
    if (!this.ios[uid]._callbacks[connection]) {
      this.ios[uid].on(connection, (response: any) => {
        this.wssWorker.postMessage({ uid, method: response.type, params: response });
      });
    }
  }

  private offResponse(uid: string, connection: string) {
    if (this.ios[uid] && this.ios[uid]._callbacks[uid]) {
      this.ios[uid].off(uid);
      this.ios[uid].off(connection);
    }
  }

  private tune(uid: string, params: any): void {
    const { connection } = params;
    const endpoint = `${Sequence.WSS_PROTOCOL}//${ToServer.domain}:${define.PORTS.SOCKET_IO}?connection=${connection}&uid=${uid}`;

    this.setId(uid);
    this.ios[uid] = io(endpoint, ToServer.option) as SocketCustom;
    this.ios[uid].on('connect', () => this.wssWorker.postMessage({ uid, method: statusTuned }));

    this.onResponseEmit(uid, connection);
    this.onResponseBoardcast(uid, connection);
    this.onRequest(uid);
    this.wssWorker.postMessage({ uid, method: statusTunning });
  }

  private untune(bootOption: Types['BootOption']): void {
    const { id } = bootOption;
    this.setId(id);
  }

  private onRequest(uid: string) {
    const actions = WsClientToApiRequestActions;
    const actionKeys = Object.keys(actions);
    const actionLength = actionKeys.length;
    const getCoreAPI = (actionName: string, beforeFunction: Function) => {
      return (requestParams: any, callback = () => {}) => {};
    };

    for (let actionNodeCnt = 0; actionNodeCnt < actionLength; actionNodeCnt++) {
      const actionName = actionKeys[actionNodeCnt];
      const actionPlainName = actionName.replace(Sequence.API_TO_SERVER_REQUEST, '');
      const beforeFunction = actions[actionName];
      this.methods[actionPlainName] = getCoreAPI(actionName, beforeFunction);
    }
  }
}
