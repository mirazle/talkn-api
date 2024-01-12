import WssWorker from 'worker-loader?inline=fallback&publicPath=/&filename=WssWorker.js!./';

import { inits } from '@common/models';
import { generateQniqueKey, generateQniqueKeySeparator } from '@common/utils';
import { ApiStore, createApiStore } from '@api/redux/store';
import ApiState from '@api/state';
import { Pid, TuneId, Status, PostMessage, statusTunning } from '.';
import Sequence from '@common/Sequence';
import { Unsubscribe } from '@reduxjs/toolkit';

type ResponseType = {
  state: ApiState;
  tuneId: string;
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

type TuneIds = {
  [tuneId: TuneId]: {
    pid: Pid;
    store: ApiStore;
    wssWorker: WssWorker;
    status: Status;
    onChangeState: (state: ApiState) => void;
    unsubscribe: Unsubscribe;
    resolve: (response: any) => void;
    reject: (response: any) => void;
  };
};
type GetGeneratePidErrorCode = string;

const separator = generateQniqueKeySeparator;
const limitPidCnt = 10;

export class StoresDispatcher {
  private uid: Uid;
  private useTuneId: TuneId;
  private tuneIds: TuneIds;
  private options: Options;
  private callback: (apiStates: ApiState[]) => void;
  constructor(options: Options = optionsInit) {
    this.getGeneratePidErrorCode = this.getGeneratePidErrorCode.bind(this);
    this.postMessage = this.postMessage.bind(this);
    this.onError = this.onError.bind(this);

    this.uid = generateQniqueKey('uid');
    this.useTuneId = '';
    this.tuneIds = {};
    this.options = optionsInit;
    this.options = options && options;
    this.callback = () => {};

    // public api endpoint.
    this.getTunePid = this.getTunePid.bind(this);
    this.getTuneIds = this.getTuneIds.bind(this);
    this.getState = this.getState.bind(this);
    this.tune = this.tune.bind(this);
    this.untune = this.untune.bind(this);
    this.fetchRank = this.fetchRank.bind(this);
    this.fetchPosts = this.fetchPosts.bind(this);
    this.fetchDetail = this.fetchDetail.bind(this);
    this.post = this.post.bind(this);
    this.onStates = this.onStates.bind(this);
  }

  public getTuneIds(): string[] {
    return Object.keys(this.tuneIds);
  }

  public getState(tuneId?: string): ApiState {
    const tuneIdKey = tuneId ? tuneId : this.useTuneId;
    if (this.tuneIds[tuneIdKey]) {
      return this.tuneIds[tuneIdKey].store.getState() as ApiState;
    }

    // TODO
    return {} as ApiState;
  }

  private async getResponse(tuneId = this.useTuneId): Promise<ResponseType> {
    return new Promise((resolve) => {
      const state = this.getState(tuneId);
      resolve({ state, tuneId });
    });
  }

  public async tune(connection: string, onChangeState = () => {}): Promise<ResponseType> {
    const generatePidErrorCode = this.getGeneratePidErrorCode(connection);
    if (generatePidErrorCode === '') {
      this.useTuneId = this.getTunePid(connection);
      this.tuneIds[this.useTuneId] = {
        pid: '',
        store: createApiStore(),
        wssWorker: new WssWorker(),
        status: statusTunning,
        onChangeState,
        unsubscribe: () => {},
        resolve: () => {},
        reject: () => {},
      };

      // boot wssWorker.
      this.tuneIds[this.useTuneId].wssWorker.onerror = this.onError;
      this.tuneIds[this.useTuneId].wssWorker.onmessage = this.onMessage.bind(this);

      const bootOption = { ...inits.bootOption, connection };
      const apiState = new ApiState({ bootOption });
      return await this.postMessage({ tuneId: this.useTuneId, method: 'tune', apiState });
    }
    console.warn(`Error: tune(${connection}) Message: ${generatePidErrorCode}`);
    return this.getResponse();
  }

  // connection | tuneId
  public async untune(prefixConnections: string | string[]): Promise<ResponseType> {
    const connections = Array.isArray(prefixConnections) ? prefixConnections : [prefixConnections];
    const untuneId = this.getTuneIds().find((tuneId) => {
      return connections.find((connection) => tuneId.startsWith(`tuneId${separator}${connection}${separator}`));
    });

    if (untuneId) {
      const tuneCh = { ...inits.ch };
      const pid = this.tuneIds[untuneId].pid;
      const response = await this.postMessage({ pid, tuneId: untuneId, method: 'untune', apiState: { tuneCh } });
      delete this.tuneIds[untuneId];
      this.useTuneId = this.useTuneId === untuneId ? '' : this.useTuneId;
      return response;
    } else {
      console.warn(`Error: untune(${prefixConnections})`);
    }
    return this.getResponse();
  }

  public async fetchRank(connection: string): Promise<ResponseType> {
    const state = this.tuneIds[this.useTuneId].store.getState() as ApiState;
    const tuneCh = { ...state.tuneCh, connection };
    return await this.postMessage({ tuneId: this.useTuneId, method: 'fetchRank', apiState: { tuneCh } });
  }

  public async fetchPosts(connection: string): Promise<ResponseType> {
    const state = this.tuneIds[this.useTuneId].store.getState() as ApiState;
    const tuneCh = { ...state.tuneCh, connection };
    return await this.postMessage({ tuneId: this.useTuneId, method: 'fetchPosts', apiState: { tuneCh } });
  }

  public async fetchDetail(connection: string): Promise<ResponseType> {
    const state = this.tuneIds[this.useTuneId].store.getState() as ApiState;
    const tuneCh = { ...state.tuneCh, connection };
    return await this.postMessage({ tuneId: this.useTuneId, method: 'fetchChDetail', apiState: { tuneCh } });
  }

  public async post(connection: string): Promise<ResponseType> {
    const state = this.tuneIds[this.useTuneId].store.getState() as ApiState;
    const tuneCh = { ...state.tuneCh, connection };
    return await this.postMessage({ tuneId: this.useTuneId, method: 'post', apiState: { tuneCh } });
  }

  public async onStates(callback: (apiStates: ApiState[]) => void) {
    this.callback = callback;
  }

  private async postMessage(params: PostMessage): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      try {
        const { pid: _pid, tuneId, method, apiState } = params;
        this.tuneIds[tuneId].unsubscribe = this.tuneIds[tuneId].store.subscribe(() => {
          if (this.tuneIds[tuneId]) {
            const apiState = this.tuneIds[tuneId].store.getState() as ApiState;
            const type = apiState.logs[0];
            if (type.startsWith(Sequence.SERVER_TO_API_BROADCAST) || type.startsWith(Sequence.SERVER_TO_API_EMIT)) {
              this.tuneIds[tuneId].onChangeState(apiState);

              const states = this.getTuneIds().map((tuneId) => {
                const state = this.tuneIds[tuneId].store.getState() as ApiState;
                console.log(state.tuneCh.connection, tuneId, state.tuneCh.tuneId, state);
                return state;
              }) as ApiState[];
              this.callback(states);

              resolve({ tuneId, state: apiState });
            }
          }
        });

        const type = `${Sequence.API_TO_SERVER_REQUEST}${method}`;
        const pid = _pid ? _pid : generateQniqueKey('pid');
        this.tuneIds[tuneId].pid = pid;
        this.tuneIds[tuneId].store.dispatch({ ...apiState, type });
        this.tuneIds[tuneId].wssWorker.postMessage({ pid, tuneId, method, apiState });
        console.log('POST MESSAGE', tuneId);
      } catch (err) {
        reject(err);
      }
    });
  }

  private onMessage(e: MessageEvent): void {
    const { currentTarget, data } = e;
    if (currentTarget instanceof Worker) {
      // methodとapiState.typeの違いは？
      const { pid, tuneId, method, apiState } = data;
      if (pid && tuneId && method && apiState && apiState.type) {
        let isExe = false;
        if (apiState.type === 'untune') {
          if (this.tuneIds[tuneId]) {
            isExe = true;
          }
        } else {
          if (this.tuneIds[tuneId] && this.tuneIds[tuneId].pid === pid) {
            isExe = true;
          }
        }

        if (isExe) {
          console.log('ON MESSAGE EXE', tuneId);
          apiState.type = `${Sequence.SERVER_TO_API_BROADCAST}${method}`;
          this.tuneIds[tuneId].store.dispatch(apiState);
          if (apiState.type === 'untune') {
            this.tuneIds[tuneId].unsubscribe();
          }
        }
      }
    }
  }

  private onError(e: ErrorEvent): void {
    console.warn(e);
  }

  private getTunePid(connection: string): string {
    const { isTuneSameCh, isTuneMultiCh } = this.options;
    const uniqueKey = generateQniqueKey(`tuneId${separator}${connection}`);
    const newTunePid = uniqueKey + separator + this.uid;
    const tuneIdCnt = this.getTuneIds().length;

    if (isTuneSameCh && isTuneMultiCh) {
      return newTunePid;
    } else if (!isTuneSameCh && isTuneMultiCh) {
      // 同じchは新しいtuneIdを許容しないが、異なるchは許容する
      const tunedSameCh = Object.keys(this.tuneIds).find((tuneId) =>
        Boolean(tuneId.startsWith(`tuneId${separator}${connection}${separator}`))
      );
      return tunedSameCh ? tunedSameCh : newTunePid;
    } else if (isTuneSameCh && !isTuneMultiCh) {
      // 同じchは新しいtuneIdを許容するが、異なるchは許容しない
      const otherCh = Object.keys(this.tuneIds).find(
        (tuneId) => !Boolean(tuneId.startsWith(`tuneId${separator}${connection}${separator}`))
      );
      return otherCh ? otherCh : newTunePid;
    } else {
      return tuneIdCnt === 1 ? Object.keys(this.tuneIds)[0] : newTunePid;
    }
  }

  private getGeneratePidErrorCode(connection: string): GetGeneratePidErrorCode {
    const { isTuneSameCh, isTuneMultiCh } = this.options;
    const tuneIdCnt = this.getTuneIds().length;

    if (tuneIdCnt === 0) {
      return '';
    } else {
      if (tuneIdCnt >= limitPidCnt) {
        return 'TUNE LIMIT';
      }

      if (isTuneSameCh && isTuneMultiCh) {
        return '';
      } else if (!isTuneSameCh && isTuneMultiCh) {
        const isError = Boolean(
          Object.keys(this.tuneIds).find((tuneId) => tuneId.startsWith(`tuneId${separator}${connection}${separator}`))
        );
        return isError ? 'BAD SAME CONNECTION' : '';
      } else if (isTuneSameCh && !isTuneMultiCh) {
        const isError = Boolean(
          Object.keys(this.tuneIds).find((tuneId) => !tuneId.startsWith(`tuneId${separator}${connection}${separator}`))
        );
        return isError ? 'BAD MULTI CONNECTION#1' : '';
      } else {
        const isError = Boolean(tuneIdCnt >= 1);
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
