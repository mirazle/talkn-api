declare module 'worker-loader?inline=fallback&publicPath=/&filename=WssWorker.js!*' {
  class WssWorker extends Worker {
    constructor();
  }
  export default WssWorker;
}

declare module NodeJS {
  interface NodeModule {
    hot?: {
      accept(path?: string, callback?: () => void): void;
    };
  }
}
