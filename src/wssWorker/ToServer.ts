import io, { Socket } from 'socket.io-client';

import Sequence from '@common/Sequence';
import conf from '@common/conf';
import define from '@common/define';
import { isValidKey } from '@common/utils';

import WsClientToApiRequestActions from '@api/redux/actions/apiToServerRequest';

import WssWorker, { statusTuned, statusTunning } from '.';

type SocketCustom = Socket & { _callbacks: { [key: string]: Function } };

// 複数のioのリクエストとレスポンスを受け取るのに専念する
export default class ToServer {
  pid: string;
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

    this.pid = '';
    this.ios = {};
    this.methods = {};
    this.wssWorker = wssWorker;
  }

  // change io connection.
  public setId(pid: string): void {
    if (pid && pid !== this.pid) {
      if (isValidKey(pid, this.ios)) {
        this.ios[pid]['disconnect']();
        delete this.ios[pid];
      }
      this.pid = pid;
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

  private onResponseEmit(pid: string, connection: string) {
    if (!this.ios[pid]._callbacks[connection]) {
      this.ios[pid].on(Sequence.EMIT_ME_KEY, (response: any) => {
        console.log('EMIT ME');
        this.wssWorker.postMessage({ pid, method: response.type, params: response });
      });
    }
  }

  private onResponseBoardcast(pid: string, connection: string) {
    if (!this.ios[pid]._callbacks[connection]) {
      this.ios[pid].on(connection, (response: any) => {
        console.log('BROARDCAST ME');
        this.wssWorker.postMessage({ pid, method: response.type, params: response });
      });
    }
  }

  private offResponse(pid: string, connection: string) {
    if (this.ios[pid] && this.ios[pid]._callbacks[pid]) {
      this.ios[pid].off(pid);
      this.ios[pid].off(connection);
    }
  }

  private tune(pid: string, params: any): void {
    const { connection } = params;
    const endpoint = `${Sequence.WSS_PROTOCOL}//${ToServer.domain}:${define.PORTS.SOCKET_IO}?connection=${connection}&pid=${pid}`;

    this.setId(pid);
    this.ios[pid] = io(endpoint, ToServer.option) as SocketCustom;
    this.ios[pid].on('connect', () => {
      console.log('CONNECT');
      this.wssWorker.postMessage({ pid, method: statusTuned });
    });

    this.onResponseEmit(pid, connection);
    this.onResponseBoardcast(pid, connection);
    this.onRequest(pid);
    this.wssWorker.postMessage({ pid, method: statusTunning });
  }

  private untune(pid: string): void {
    this.setId(pid);
  }

  private onRequest(pid: string) {
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
