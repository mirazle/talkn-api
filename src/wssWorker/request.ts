import io, { Socket } from 'socket.io-client';

import { Types } from '@common/models';
import Sequence from '@common/Sequence';
import conf from '@common/conf';
import define from '@common/define';
import { isValidKey } from '@common/utils';

import WsClientToApiRequestActions from '@api/redux/actions/apiToServerRequest';
import WsServerToApiBroadcastAction from '@api/redux/actions/serverToApiBradcast';
import WsServerToApiEmitAction from '@api/redux/actions/serverToApiEmit';
import ApiState from '@api/state';
import apiStore, { ApiStore, ReduxState } from '@api/redux/store';

import WssWorker from '.';

type SocketCustom = Socket & { _callbacks: { [key: string]: Function } };

// storesを剥ぎ取る
// ioのリクエストとレスポンスを受け取るのに専念する
export default class Request {
  id: string;
  wssWorker: WssWorker;
  ios: { [id: string]: SocketCustom };
  stores: { [id: string]: ApiStore };
  methods: { [key: string]: Function };
  publicCallbacks: { [key: string]: Function };
  static get server() {
    return conf.env === define.DEVELOPMENT || conf.env === define.LOCALHOST ? define.DEVELOPMENT_DOMAIN : define.PRODUCTION_DOMAIN;
  }
  static get option() {
    return { forceNew: true };
  }
  constructor(wssWorker: WssWorker) {
    this.id = '';
    this.use = this.use.bind(this);
    this.tune = this.tune.bind(this);
    this.tuned = this.tuned.bind(this);
    this.untune = this.untune.bind(this);
    this.exe = this.exe.bind(this);
    this.onResponseMeAPI = this.onResponseMeAPI.bind(this);
    this.offResponseChAPI = this.offResponseChAPI.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.exeCallback = this.exeCallback.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);

    this.stores = {};
    this.ios = {};
    this.methods = {};
    this.publicCallbacks = {};
    this.wssWorker = wssWorker;
    this.wssWorker.postMessage('WSS_CONSTRUCTED', { ioType: Sequence.API_SETUP });
  }

  // change io connection.
  public use(id: string): boolean {
    if (isValidKey(id, this.stores) && isValidKey(this.id, this.ios)) {
      this.id = id;
      return true;
    } else {
      return false;
    }
  }

  public exe(method: string, params: ApiStore): boolean {
    if (isValidKey(method, this) && typeof this[method] === 'function') {
      (this as any)[method](params);
      return true;
    }

    if (isValidKey(method, this.methods) && typeof this.methods[method] === 'function') {
      (this.methods as any)[method](params);
      return true;
    }

    return false;
  }

  public onResponseChAPI(connection: string) {
    const getResponseChAPI = (actionMethod: (response: any) => void) => {
      return (response: any) => {
        const actionState = actionMethod(response);
        if (isValidKey(this.id, this.stores)) {
          const store = this.stores[this.id] as any; // TODO: resolve any
          // dispatchメソッドの存在をチェック
          if (store && 'dispatch' in store) {
            // ここでdispatch?????
            store.dispatch(actionState);
          }
        }
      };
    };

    const callback: any = getResponseChAPI(WsServerToApiBroadcastAction);
    this.on(connection, callback);
  }

  public offResponseChAPI(connection: string) {
    this.off(connection);
  }

  private tune(bootOption: Types['BootOption']) {
    if (!this.use(bootOption.id)) {
      const getIoParams = (bootOption: Types['BootOption']) => {
        let params = '';
        Object.keys(bootOption).forEach((key) => {
          if (key === 'connection') {
            if (isValidKey(key, bootOption)) {
              const value = bootOption[key];
              params += `${key}=${encodeURIComponent(value)}&`;
            }
          }
        });
        return params.replace(/&$/, '');
      };

      // id
      this.id = bootOption.id;

      // store.
      this.stores[this.id] = apiStore;
      this.stores[this.id].subscribe(this.subscribe); // 必要？
      const apiState = new ApiState({ bootOption });

      this.stores[this.id].dispatch({ ...apiState, type: 'SETUPED_API_STORE' });

      // ws server.
      const ioParams = getIoParams(bootOption);
      const endpoint = `${Sequence.WSS_PROTOCOL}//${Request.server}:${define.PORTS.SOCKET_IO}?${ioParams}`;

      this.ios[this.id] = io(endpoint, Request.option) as SocketCustom;
      this.ios[this.id].on('connect', this.tuned);

      this.onResponseChAPI(bootOption.connection);
      this.onRequestAPI();
      this.onResponseMeAPI();
      return true;
    } else {
      return false;
    }
  }

  private tuned() {
    this.wssWorker.postMessage('TUNED', { id: this.id, ioType: Sequence.API_SETUP });
  }

  private untune(bootOption: Types['BootOption']) {
    const id = bootOption && bootOption.id ? bootOption.id : this.id;
    if (this.ios[id]) {
      this.ios[id]['disconnect']();
      delete this.ios[id];
      delete this.stores[id];
      if (Object.keys(this.ios).length > 0) {
        this.id = Object.keys(this.ios)[0];
      }
      return true;
    }
    return false;
  }

  private onRequestAPI() {
    const actions = WsClientToApiRequestActions;
    const actionKeys = Object.keys(actions);
    const actionLength = actionKeys.length;
    const getCoreAPI = (actionName: string, beforeFunction: Function) => {
      return (requestParams: any, callback = () => {}) => {
        // TODO: resolve any
        const reduxState = this.stores[this.id].getState();
        const _requestState = Sequence.getRequestState(actionName, reduxState, requestParams);
        const _actionState = Sequence.getRequestActionState(actionName, requestParams);
        const { requestState, actionState } = beforeFunction(reduxState, _requestState, _actionState);
        this.publicCallbacks[requestState.type] = callback;
        //        console.log(requestState.type, requestState.app.offsetFindId);
        this.ios[this.id].emit(requestState.type, requestState);
        return this.stores[this.id].dispatch(actionState);
      };
    };

    for (let actionNodeCnt = 0; actionNodeCnt < actionLength; actionNodeCnt++) {
      const actionName = actionKeys[actionNodeCnt];
      const actionPlainName = actionName.replace(Sequence.API_TO_SERVER_REQUEST, '');
      const beforeFunction = actions[actionName];
      this.methods[actionPlainName] = getCoreAPI(actionName, beforeFunction);
    }
  }

  // TODO resolve any
  private onResponseMeAPI() {
    const getToMeAPI = (action: any) => {
      return (response: any) => {
        const actionState = action(response);
        this.stores[this.id].dispatch(actionState);
      };
    };
    const callback: any = getToMeAPI(WsServerToApiEmitAction);
    this.on(Sequence.CATCH_ME_KEY, callback);
  }

  private on(onKey: string, callback = () => {}) {
    if (this.id && !this.ios[this.id]._callbacks[onKey]) {
      this.ios[this.id].on(onKey, callback);
    }
  }

  private off(offKey: string) {
    //console.log('OFF', this.id, offKey, this.ios);
    if (this.ios[this.id] && this.ios[this.id]._callbacks[`$${offKey}`]) {
      this.ios[this.id].off(offKey);
    }
  }

  private subscribe() {
    const apiState = this.stores[this.id].getState() as ReduxState;
    const actionType = apiState.logs[0];
    const ioType = Sequence.convertServerToApiIoType(this.id, actionType);
    this.exeCallback(actionType, apiState);
    this.wssWorker.postMessage(actionType, { ...apiState, ioType });
  }

  private exeCallback(method: string, apiState: ApiState) {
    const { actionType, actionName } = Sequence.getSequenceActionMap(method);
    if (actionName !== Sequence.API_BROADCAST_CALLBACK) {
      if (actionType === Sequence.API_RESPONSE_TYPE_EMIT) {
        if (this.publicCallbacks[actionName]) {
          const { posts, tuneCh } = apiState;
          this.publicCallbacks[actionName](apiState, { posts, tuneCh });
        }
      }
    }

    if (actionType === Sequence.API_RESPONSE_TYPE_BROADCAST) {
      if (this.publicCallbacks[Sequence.API_BROADCAST_CALLBACK]) {
        const { posts, tuneCh } = apiState;
        this.publicCallbacks[Sequence.API_BROADCAST_CALLBACK](actionName, { posts, tuneCh });
      }
    }
  }
}
