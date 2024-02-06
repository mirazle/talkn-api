import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import ApiState from '../../src/state';

type SortTipsProps = {
  tableName: string;
  columnName: string;
  sort: Sort;
  onClick: (sort: Sort) => void;
};

const SortTips: React.FC<SortTipsProps> = ({ tableName, columnName, sort, onClick }) => {
  const handleOnClickAsc = () => {
    onClick({ tableName, columnName, asc: true });
  };

  const handleOnClickDesc = () => {
    onClick({ tableName, columnName, asc: false });
  };

  return (
    <SortTipsContainer>
      <SortTip key="asc" onClick={handleOnClickAsc}>
        {tableName === sort.tableName && columnName === sort.columnName && sort.asc ? '▲' : '△'}
      </SortTip>
      <SortTip key="desc" onClick={handleOnClickDesc}>
        {tableName === sort.tableName && columnName === sort.columnName && !sort.asc ? '▼' : '▽'}
      </SortTip>
    </SortTipsContainer>
  );
};

type Sort = {
  tableName: string;
  columnName: string;
  asc: boolean;
};

type Props = {
  isUniqueConnection: boolean;
  states: ApiState[];
};

const Component: React.FC<Props> = ({ isUniqueConnection, states }) => {
  const [sort, setSort] = useState<Sort>({ tableName: 'tuneCh', columnName: 'tuneId', asc: true });
  const [showStates, setShowStates] = useState(states);

  const sortLogic = (a: ApiState, b: ApiState) => {
    const { tableName, columnName, asc } = sort;
    const key = tableName as keyof ApiState;
    const compareValues = (val1: any, val2: any): number => {
      if (typeof val1 === 'number' && typeof val2 === 'number') {
        return val1 - val2;
      } else if (typeof val1 === 'string' && typeof val2 === 'string') {
        return val1.localeCompare(val2);
      } else {
        return 0;
      }
    };
    const aState = a[key] as any;
    const bState = b[key] as any;

    if (typeof aState === 'object' && typeof bState === 'object' && aState && bState) {
      const aValue = aState[columnName];
      const bValue = bState[columnName];
      return asc ? compareValues(aValue, bValue) : compareValues(bValue, aValue);
    }

    return 0;
  };

  const handleOnClickSort = (sort: Sort) => {
    setSort({ ...sort });
  };

  useEffect(() => {
    const sortedStates = showStates.sort(sortLogic);
    console.log(sortedStates);
    setShowStates([...sortedStates]);
  }, [sort]);

  useEffect(() => {
    if ((states !== showStates && states.length > 0) || showStates.length > 0) {
      const sortedStates = states.sort(sortLogic);
      setShowStates([...sortedStates]);
    }
  }, [states]);

  const thead = (
    <thead>
      <tr>
        {!isUniqueConnection && (
          <td className="tuneCh_tuneId">
            <TdLabelWrap>
              tuneId <SortTips tableName={'tuneCh'} columnName={'tuneId'} sort={sort} onClick={handleOnClickSort} />
            </TdLabelWrap>
          </td>
        )}
        <td className="tuneCh_connection">
          <TdLabelWrap>
            connection <SortTips tableName={'tuneCh'} columnName={'connection'} sort={sort} onClick={handleOnClickSort} />
          </TdLabelWrap>
        </td>
        <td className="tuneCh_server">
          <TdLabelWrap>
            server <SortTips tableName={'tuneCh'} columnName={'server'} sort={sort} onClick={handleOnClickSort} />
          </TdLabelWrap>
        </td>
        <td className="tuneCh_liveCnt">
          <TdLabelWrap>
            liveCnt <SortTips tableName={'tuneCh'} columnName={'liveCnt'} sort={sort} onClick={handleOnClickSort} />
          </TdLabelWrap>
        </td>
        <td className="posts">
          <TdLabelWrap>posts</TdLabelWrap>
        </td>
        <td className="rank">
          <TdLabelWrap>rank</TdLabelWrap>
        </td>
        <td className="detail">
          <TdLabelWrap>detail</TdLabelWrap>
        </td>
        <td className="action">
          <TdLabelWrap>action</TdLabelWrap>
        </td>
      </tr>
    </thead>
  );

  const tbody = () => {
    let trs: React.JSX.Element[] = [];
    if (showStates.length === 0) {
      trs = [
        <tr key="noData" className="noData">
          <td colSpan={!isUniqueConnection ? 8 : 7} align="center">
            NO DATA
          </td>
        </tr>,
      ];
    } else {
      trs = showStates.map((stateParams, index) => {
        const state = new ApiState(stateParams);
        const { tuneCh } = state;
        return (
          <tr key={index}>
            {!isUniqueConnection && <td className="tuneCh_tuneId">{tuneCh.tuneId}</td>}
            <td className="tuneCh_connection">{tuneCh.connection}</td>
            <td className="tuneCh_server">{tuneCh.server}</td>
            <td className="tuneCh_liveCnt">{tuneCh.liveCnt}</td>
            <td className="posts"></td>
            <td className="rank"></td>
            <td className="detail"></td>
            <td className="action">
              <select>
                <option>-</option>
                <option>post</option>
                <option>fetchRank</option>
                <option>fetchDetail</option>
                <option>untune</option>
              </select>
            </td>
          </tr>
        );
      });
    }

    return <tbody>{trs}</tbody>;
  };

  return (
    <Container>
      <Table>
        {thead}
        {tbody()}
      </Table>
    </Container>
  );
};

export default Component;

const Container = styled.section`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: #555;
`;

const Table = styled.table`
  table-layout: fixed;
  border-collapse: collapse;
  width: 98%;
  margin: 0 1%;
  thead {
    background: rgb(79, 174, 159);
    color: #eee;
  }
  tbody {
    tr:nth-child(odd) {
      background: #fefefe;
    }
    tr:nth-child(even) {
      background: #efefef;
    }
    tr:hover:not(.noData) {
      background: rgba(255, 255, 236, 1);
    }
  }
  thead td {
    overflow: hidden;
    text-align: center;
  }
  td {
    padding: 8px;
    border: 1px solid slategray;
    word-wrap: break-word; /* 長い単語も折り返す */
  }

  td.tuneCh_tuneId {
    overflow-x: scroll;
    white-space: nowrap;
    word-wrap: none;
  }
  td.tuneCh_liveCnt {
    text-align: center;
  }
  td.action {
    overflow: hidden;
    text-align: center;
    select {
      padding: 8px 16px;
      appearance: unset;
      border: 1px solid slategray;
      border-radius: 4px;
      color: #555;
    }
  }
`;

const TdLabelWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SortTipsContainer = styled.span``;

const SortTip = styled.span`
  cursor: pointer;
  user-select: none;
`;
