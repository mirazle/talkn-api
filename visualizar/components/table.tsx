import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Types } from '../../common/src/models';
import ApiState from '../../src/state';
import { colors, getRgba } from '../styles';

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
        <td className="rank">
          <TdLabelWrap>rank</TdLabelWrap>
        </td>
        <td className="rankAll">
          <TdLabelWrap>rankAll</TdLabelWrap>
        </td>
        {/*
        <td className="posts">
          <TdLabelWrap>posts</TdLabelWrap>
        </td>
        <td className="detail">
          <TdLabelWrap>detail</TdLabelWrap>
        </td>
        <td className="action">
          <TdLabelWrap>action</TdLabelWrap>
        </td>
      */}
      </tr>
    </thead>
  );

  const tbody = () => {
    let trs: React.JSX.Element[] = [];
    if (showStates.length === 0) {
      trs = [
        <tr key="noData" className="noData">
          <td colSpan={!isUniqueConnection ? 6 : 5} align="center">
            NO DATA
          </td>
        </tr>,
      ];
    } else {
      trs = showStates.map((stateParams, index) => {
        const state = new ApiState(stateParams);
        const { tuneCh, posts, rank, rankAll } = state;
        const { tuneId, connection, server, liveCnt } = tuneCh;
        const digits = String(liveCnt).length;

        const renderRank = (rankData: Types['Rank'][]) => {
          // console.log('@@', tuneCh, rankData, typeof rankData);
          if (!rankData || rankData.length === 0) return null;
          const lis = rankData.map((r, i) => {
            const showCon = r.connection.replace(connection, '');
            const digits = String(r.liveCnt).length;
            return (
              <li key={i}>
                <LiveCnt $digits={digits}>{r.liveCnt}</LiveCnt>
                <span>{showCon}</span>
              </li>
            );
          });
          return <ol className="rankOl">{lis}</ol>;
        };

        return (
          <tr key={index}>
            {!isUniqueConnection && <td className="tuneCh_tuneId">{tuneId}</td>}
            <td className="tuneCh_connection">{connection}</td>
            <td className="tuneCh_server">{server}</td>
            <td className="tuneCh_liveCnt">
              <LiveCnt $digits={digits}>{liveCnt}</LiveCnt>
            </td>
            <td className="rank">{renderRank(rank)}</td>
            <td className="rankAll">{renderRank(rankAll)}</td>
            {/*
            <td className="posts">{posts.length}</td>
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
        */}
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
    background: ${getRgba(colors.theme)};
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
  td.rank,
  td.rankAll {
    ol {
      padding: 0;
      list-style: none;
    }
    li {
      span {
        margin-left: 8px;
      }
    }
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

const LiveCnt = styled.span<{ $digits: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${getRgba(colors.theme)};
  border-radius: 50%;
  width: 14px;
  min-width: 14px;
  max-width: unset;
  height: 14px;
  min-height: 14px;
  max-height: 14px;
  padding: 8px;
  font-size: 12px;
  color: #eee;
`;
