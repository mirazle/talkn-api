import Sequence from '@common/Sequence';
import { ReduxState } from '@api/redux/store';
/*
type BeforeFunction  = {
  (reduxState: ApiState, requestState: any, actionState: any): any;
}

const beforeFunctions: { [key: string]: BeforeFunction } = {};
*/

// TODO: any
let actions: { [key: string]: (reduxState: ReduxState, requestState: any, actionState: any) => any } = {};
/*
Object.keys(Sequence.map).forEach((endpoint) => {
  const type = `${Sequence.API_TO_SERVER_REQUEST}${endpoint}`;
  actions[type] = (reduxState: ApiState, requestState, actionState) => {
    if (beforeFunctions[requestState.type]) {
      return beforeFunctions[requestState.type](reduxState, requestState, actionState);
    }
    return { requestState, actionState };
  };
});
*/
export default actions;
