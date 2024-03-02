import io, { Socket } from 'socket.io-client';

import BootOptionModel from '@common/models/BootOption';
import Sequence from '@common/Sequence';
import conf from '@common/conf';
import define from '@common/define';
import { isValidKey } from '@common/utils';
import ChModel from '@common/models/Ch';
import { TuneOption, init as tuneOptionInit } from '@common/models/TuneOption';
import WsClientToApiRequestActions from '@api/redux/actions/apiToServerRequest';
import ApiState from '@api/state';

import WssWorker, { Pid, TuneId, statusTunning } from '.';

type SocketCustom = Socket & { _callbacks: { [key: string]: Function } };

// 複数のioのリクエストとレスポンスを受け取るのに専念する
export default class ToServer {
  ios: { [tuneId: TuneId]: SocketCustom };
  methods: { [key: string]: Function };
  wssWorker: WssWorker;
  static get domain() {
    return conf.env === define.DEVELOPMENT || conf.env === define.LOCALHOST ? define.DEVELOPMENT_DOMAIN : define.PRODUCTION_DOMAIN;
  }
  static get option() {
    return {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['polling', 'websocket'],
      upgrade: true,
      forceNew: false,
      query: {},
      withCredentials: false,
      extraHeaders: {},
    };
  }
  constructor(wssWorker: WssWorker) {
    this.tune = this.tune.bind(this);
    this.untune = this.untune.bind(this);
    this.exe = this.exe.bind(this);
    this.onConnect = this.onConnect.bind(this);
    this.onConnectError = this.onConnectError.bind(this);

    this.onRequestMethods = this.onRequestMethods.bind(this);
    this.onResponseEmit = this.onResponseEmit.bind(this);
    this.onResponseBoardcast = this.onResponseBoardcast.bind(this);
    this.offResponse = this.offResponse.bind(this);

    this.ios = {};
    this.methods = {};
    this.wssWorker = wssWorker;
  }

  public exe(pid: Pid, tuneId: TuneId, method: string, params: Partial<ApiState>): void {
    if (isValidKey(method, this) && typeof this[method] === 'function') {
      (this as any)[method](pid, tuneId, params);
    }

    if (isValidKey(method, this.methods) && typeof this.methods[method] === 'function') {
      (this.methods as any)[method](pid, tuneId, params);
    }
  }

  private tune(pid: Pid, tuneId: TuneId, { bootOption }: Partial<ApiState>): void {
    let connection = ChModel.rootConnection;
    let tuneOption: TuneOption = { ...tuneOptionInit };
    let urlSearchParams = `?tuneId=${tuneId}`;

    if (bootOption) {
      connection = BootOptionModel.getConnection(bootOption.connection);
      tuneOption = bootOption.tuneOption;
      urlSearchParams += `&${BootOptionModel.getTuneOptionString(bootOption.tuneOption)}`;
    }

    const endpoint = `${Sequence.HTTPS_PROTOCOL}//${ToServer.domain}:${define.PORTS.IO_LB}${urlSearchParams}`;
    this.ios[tuneId] = io(endpoint, { ...ToServer.option, path: connection }) as SocketCustom;
    this.ios[tuneId].on('connect', () => this.wssWorker.postMessage({ pid, tuneId, method: statusTunning }));

    this.ios[tuneId].on('disconnect', () => {
      const response = { type: 'untune' } as any;
      this.wssWorker.postMessage({ pid, tuneId, method: response.type, apiState: response });
      delete this.ios[tuneId];
    });

    this.ios[tuneId].on('connect_error', (error) => {
      console.error('Connection error:', tuneId, error);
    });
    this.onResponseEmit(pid, tuneId, connection);
    this.onResponseBoardcast(pid, tuneId, connection, tuneOption);
    this.onRequestMethods(pid, tuneId);
  }

  private untune(_: Pid, tuneId: TuneId): void {
    if (isValidKey(tuneId, this.ios)) {
      this.ios[tuneId]['disconnect']();
    }
  }

  private onRequestMethods(pid: Pid, tuneId: TuneId) {
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
  private onConnect() {}

  private onConnectError() {}

  private onResponseEmit(pid: Pid, tuneId: string, connection: string) {
    if (!this.ios[tuneId]._callbacks[connection]) {
      this.ios[tuneId].on(tuneId, (response: any) => {
        this.wssWorker.postMessage({ pid, tuneId, method: response.type, apiState: response });
      });
    }
  }

  private onResponseBoardcast(pid: Pid, tuneId: string, connection: string, tuneOption: TuneOption) {
    if (!this.ios[tuneId]._callbacks[connection]) {
      const callback = (response: Partial<ApiState> & { type: string }) => {
        this.wssWorker.postMessage({ pid, tuneId, method: response.type, apiState: response });
      };

      this.ios[tuneId].on(connection, callback);
      Object.keys(tuneOption).forEach((liveMethod) => {
        if (isValidKey(liveMethod, tuneOptionInit) && tuneOption[liveMethod]) {
          this.ios[tuneId].on(`${liveMethod}:${connection}`, callback);
        }
      });
    }
  }

  private offResponse(tuneId: TuneId, connection: string) {
    if (this.ios[tuneId] && this.ios[tuneId]._callbacks[tuneId]) {
      this.ios[tuneId].off(tuneId);
      this.ios[tuneId].off(connection);
    }
  }
}
