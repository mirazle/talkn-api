import React, { useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ApiState from '../src/state';

type Props = {
  states?: ApiState[];
};

const Component: React.FC<Props> = ({ states }) => {
  if (states && states.length > 0) {
    const trs = states.map((stateParams, index) => {
      const state = new ApiState(stateParams);
      const { tuneCh } = state;
      return (
        <tr key={index}>
          <td>{tuneCh.tuneId}</td>
          <td>{tuneCh.connection}</td>
          <td>{tuneCh.liveCnt}</td>
        </tr>
      );
    });
    return (
      <table border={1}>
        <thead>{trs}</thead>
      </table>
    );
  } else {
    return <div>MOMO</div>;
  }
};

const Tables: React.FC<Props> = ({ states }) => {
  useCallback(() => {}, []);
  useEffect(() => {
    console.log(window.talknAPI.getTuneIds());
  }, []);
  return <div>MOMO</div>;
};

window.onload = () => {
  const container = document.querySelector('#visualizar');
  if (container) {
    const root = createRoot(container);
    const callback = (states: ApiState[]) => root.render(<Component states={states} />);
    window.talknAPI.onStates(callback);
    root.render(<Component />);
  }
};
