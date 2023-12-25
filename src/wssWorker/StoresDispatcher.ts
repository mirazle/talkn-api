import WssWorker from 'worker-loader?inline=fallback&publicPath=/&filename=WssWorker.js!./';

import { init as bootOptionInit } from '@common/models/BootOption';
import { generateQniqueKey, generateQniqueKeySeparator } from '@common/utils';
import apiStore, { ApiStore } from '@api/redux/store';
import ApiState from '@api/state';
import { Status, statusStop, statusBooting } from '.';
import Sequence from '@common/Sequence';

type ResponseType = {
  state: ApiState;
  pid: string;
};

type Options = {
  isTuneSameCh?: boolean;
  isTuneMultiCh?: boolean;
  isDebug?: boolean;
};

const optionsInit: Options = {
  isTuneSameCh: true,
  isTuneMultiCh: true,
  isDebug: true,
};

type Uid = string;
type Pid = string;
type GetGeneratePidErrorCode = string;

const pidSeparator = generateQniqueKeySeparator;
const limitPidCnt = 5;

export class StoresDispatcher {
  private uid: Uid;
  private usePid: Pid;
  private pids: { [pid: Pid]: { store: ApiStore; wssWorker: WssWorker } };
  private status: Status;
  private options: Options;
  constructor(options: Options = optionsInit) {
    this.getGeneratePidErrorCode = this.getGeneratePidErrorCode.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.onError = this.onError.bind(this);

    this.uid = generateQniqueKey('uid');
    this.usePid = '';
    this.pids = {};
    this.status = statusStop;
    this.options = optionsInit;
    this.options = options && options;

    // public api endpoint.
    this.getPids = this.getPids.bind(this);
    this.getState = this.getState.bind(this);
    this.tune = this.tune.bind(this);
    this.untune = this.untune.bind(this);
    this.fetchRank = this.fetchRank.bind(this);
    this.fetchPosts = this.fetchPosts.bind(this);
    this.fetchChDetail = this.fetchChDetail.bind(this);
    this.post = this.post.bind(this);
  }

  public getPids(): string[] {
    return Object.keys(this.pids);
  }

  public getState(): ApiState {
    if (this.usePid && this.pids[this.usePid]) {
      return this.pids[this.usePid].store.getState() as ApiState;
    }
    throw `Error: No Exist Use Pid ${this.usePid}`;
  }

  private async getResponse(): Promise<ResponseType> {
    return new Promise((resolve) => {
      const state = this.getState();
      resolve({ state, pid: this.usePid });
    });
  }

  public async tune(connection: string): Promise<ResponseType> {
    const generatePidErrorCode = this.getGeneratePidErrorCode(connection);
    if (generatePidErrorCode === '') {
      const pid = generateQniqueKey(connection) + pidSeparator + this.uid;
      this.usePid = pid;
      this.status = statusBooting;
      this.pids[pid] = { store: apiStore, wssWorker: new WssWorker() };
      this.pids[pid].store.subscribe(() => this.subscribe(pid));

      // boot wssWorker.
      this.pids[pid].wssWorker.onerror = this.onError;
      this.pids[pid].wssWorker.onmessage = this.onMessage.bind(this);

      const bootOption = { ...bootOptionInit };
      const apiState = new ApiState({ bootOption });
      this.pids[pid].store.dispatch({ ...apiState, type: this.status });
      return await this.postMessage(pid, 'tune', { connection });
    }
    console.warn(`Error: tune(${connection}) Message: ${generatePidErrorCode}`);
    return this.getResponse();
  }

  public async untune(connection: string): Promise<ResponseType> {
    if (this.usePid && this.pids[this.usePid]) {
      const response = await this.postMessage(this.usePid, 'untune', { connection });
      delete this.pids[this.usePid];
      this.usePid = '';
      return response;
    }
    console.warn(`Error: untune(${connection})`);
    return this.getResponse();
  }

  public async fetchRank(connection: string): Promise<ResponseType> {
    return await this.postMessage(this.usePid, 'tune', { connection });
  }

  public async fetchPosts(connection: string): Promise<ResponseType> {
    return await this.postMessage(this.usePid, 'fetchPosts', { connection });
  }

  public async fetchChDetail(connection: string): Promise<ResponseType> {
    return await this.postMessage(this.usePid, 'fetchChDetail', { connection });
  }

  public async post(connection: string): Promise<ResponseType> {
    return await this.postMessage(this.usePid, 'post', { connection });
  }

  private async postMessage(pid: string, method: string, params: any): Promise<ResponseType> {
    return new Promise((resolve) => {
      const type = `${Sequence.API_TO_SERVER_REQUEST}${method}`;
      this.pids[pid].store.dispatch({ ...params, type });
      this.pids[pid].wssWorker.postMessage({ pid, method, params });
    });
  }

  private onMessage(e: MessageEvent): void {
    const { currentTarget, data } = e;
    if (currentTarget instanceof Worker) {
      const { pid, method, params } = data;
      if (pid && method && params && params.type && this.pids[pid].store) {
        const type = `${Sequence.SERVER_TO_API_BROADCAST}${method}`;
        this.pids[pid].store.dispatch({ ...params, type });
        console.log('DISPATCHED', pid);
      }
    }
  }

  private onError(e: ErrorEvent): void {
    console.warn(e);
  }

  private async subscribe(pid: string): Promise<ResponseType> {
    // console.log('SUBSCRIBE', pid);
    return await this.getResponse();
  }

  private getGeneratePidErrorCode(connection: string): GetGeneratePidErrorCode {
    const { isTuneSameCh, isTuneMultiCh } = this.options;
    const pidCnt = this.getPids().length;

    if (pidCnt === 0) {
      return '';
    } else {
      if (pidCnt >= limitPidCnt) {
        return 'TUNE LIMIT';
      }

      if (isTuneSameCh && isTuneMultiCh) {
        return '';
      } else if (!isTuneSameCh && isTuneMultiCh) {
        const isError = Boolean(Object.keys(this.pids).find((pid) => pid.startsWith(`${connection}${pidSeparator}`)));
        return isError ? 'BAD SAME CONNECTION' : '';
      } else if (isTuneSameCh && !isTuneMultiCh) {
        const isError = Boolean(Object.keys(this.pids).find((pid) => !pid.startsWith(`${connection}${pidSeparator}`)));
        return isError ? 'BAD MULTI CONNECTION#1' : '';
      } else {
        const isError = Boolean(pidCnt >= 1);
        return isError ? 'BAD MULTI CONNECTION#2' : '';
      }
    }
  }
}

const createStoresDispatcher = async (options?: Options): Promise<StoresDispatcher> => {
  const storesDispatcher = new StoresDispatcher(options);
  return storesDispatcher;
};

export default createStoresDispatcher;
