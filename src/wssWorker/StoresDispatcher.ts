import WssWorker from 'worker-loader?inline=fallback&publicPath=/&filename=WssWorker.js!./';

import { init as bootOptionInit } from '@common/models/BootOption';
import { generateQniqueKey, isValidKey } from '@common/utils';
import apiStore, { ApiStore, ReduxState } from '@api/redux/store';
import ApiState from '@api/state';
import { Status, statusStop, statusBooting } from '.';
import Sequence from '@common/Sequence';
import { subscribe } from 'diagnostics_channel';

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

export class StoresDispatcher {
  private uid: string;
  private wssWorker: WssWorker;
  private stores: { [storeId: string]: ApiStore };
  private status: Status;
  private options: Options;
  private callback?: Function;
  constructor(options: Options = optionsInit) {
    // boot wssWorker.
    this.wssWorker = new WssWorker();
    this.wssWorker.onerror = this.onError;
    this.wssWorker.onmessage = this.onMessage.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.onError = this.onError.bind(this);

    this.uid = '';
    this.status = statusStop;
    this.options = optionsInit;
    this.stores = {};
    this.options = options && options;

    // public api.
    this.getState = this.getState.bind(this);
    this.tune = this.tune.bind(this);
    this.untune = this.untune.bind(this);
    this.fetchRank = this.fetchRank.bind(this);
    this.fetchPosts = this.fetchPosts.bind(this);
    this.fetchChDetail = this.fetchChDetail.bind(this);
    this.post = this.post.bind(this);
  }

  public async getState(): Promise<ApiState> {
    return this.stores[this.uid].getState() as ApiState;
  }

  public async tune(connection: string): Promise<ApiState> {
    const { isTuneSameCh, isTuneMultiCh } = this.options;

    let uid;
    if (isTuneSameCh && isTuneMultiCh) {
      uid = generateQniqueKey('uid');
    } else if (!isTuneSameCh && isTuneMultiCh) {
      uid = connection;
    } else if (isTuneSameCh && !isTuneMultiCh) {
      uid = generateQniqueKey('uid');
    } else {
      uid = connection;
    }

    if (!isValidKey(uid, this.stores)) {
      this.uid = uid;
      this.status = statusBooting;
      this.stores[uid] = apiStore;

      const bootOption = { ...bootOptionInit, uid, connection };
      const apiState = new ApiState({ bootOption });
      this.stores[uid].dispatch({ ...apiState, type: this.status });
      return await this.postMessage(uid, 'tune', { connection });
    }

    return await this.getState();
  }

  public async untune(connection: string): Promise<ApiState> {
    return await this.postMessage(this.uid, 'tune', { connection });
  }

  public async fetchRank(connection: string): Promise<ApiState> {
    return await this.postMessage(this.uid, 'tune', { connection });
  }

  public async fetchPosts(connection: string): Promise<ApiState> {
    return await this.postMessage(this.uid, 'fetchPosts', { connection });
  }

  public async fetchChDetail(connection: string): Promise<ApiState> {
    return await this.postMessage(this.uid, 'fetchChDetail', { connection });
  }

  public async post(connection: string): Promise<ApiState> {
    return await this.postMessage(this.uid, 'post', { connection });
  }

  private async postMessage(uid: string, method: string, params: any): Promise<ApiState> {
    return new Promise((resolve) => {
      const type = `${Sequence.API_TO_SERVER_REQUEST}${method}`;
      this.stores[uid].dispatch({ ...params, type });
      this.wssWorker.postMessage({ uid, method, params });
      this.stores[uid].subscribe(() => resolve(this.getState()));
    });
  }

  private onMessage(e: MessageEvent): void {
    const { currentTarget, data } = e;
    if (currentTarget instanceof Worker) {
      const { uid, method, params } = data;
      if (uid && method && params && params.type && this.stores[uid]) {
        const type = `${Sequence.SERVER_TO_API_BROADCAST}${method}`;
        this.stores[uid].dispatch({ ...params, type });
      }
    }
  }

  private onError(e: ErrorEvent): void {
    console.warn(e);
  }
}

const createStoresDispatcher = async (): Promise<StoresDispatcher> => {
  const storesDispatcher = new StoresDispatcher();
  return storesDispatcher;
};

export default createStoresDispatcher;
