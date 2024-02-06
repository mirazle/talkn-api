import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { createRoot } from 'react-dom/client';
import ApiState from '../src/state';
import { RequiredOptions, limitPidCnt } from '../src/wssWorker/StoresDispatcher';
import define from '../src/common/define';

import Table from './components/table';
import { colors, getRgba } from './styles';

type Props = {
  uid: string;
  options: RequiredOptions;
  states?: ApiState[];
};

const Layout: React.FC<Props> = ({ uid, states, options }) => {
  return (
    <Container>
      <Header>talkn api visualizer</Header>
      <TuneCnt>
        {states ? states.length : 0}
        <span className="limitPidCnt">/{limitPidCnt}</span>
      </TuneCnt>
      <Uid>{uid}</Uid>
      <OptionMenu options={options}></OptionMenu>
      <br />
      <Visualizar states={states} />
      <Footer></Footer>
    </Container>
  );
};

type OptionMenuProps = {
  options: RequiredOptions;
};

const OptionMenu: React.FC<OptionMenuProps> = ({ options }) => {
  return (
    <OptionUl>
      {Object.keys(options).map((key) => {
        const keysLabel = key as keyof RequiredOptions;
        const keysValue = Boolean(options[keysLabel]) ? 1 : 0;
        const href = Object.keys(options).reduce((prev, cur, index) => {
          const reduceLabel = cur as keyof RequiredOptions;
          const queryKey = index === 0 ? '?' : '';
          const querySeparatot = index !== 0 ? '&' : '';
          let value = 0;
          if (keysLabel === cur) {
            value = keysValue === 0 ? 1 : 0;
          } else {
            value = options[reduceLabel] ? 1 : 0;
          }

          return `${queryKey}${prev}${querySeparatot}${cur}=${value}`;
        }, '');

        return (
          <OptionLi key={keysLabel} value={keysValue}>
            <a href={href}>{keysLabel}</a>
          </OptionLi>
        );
      })}
    </OptionUl>
  );
};

type DuplicateProps = {
  states?: ApiState[];
};

const Visualizar: React.FC<DuplicateProps> = ({ states = [] }) => {
  const [isUniqueConnection, setIsUniqueConnection] = useState(false);
  const [showStates, setShowStates] = useState(states);

  const setStatesLogic = (isUniqueConnection: boolean) => {
    if (isUniqueConnection) {
      const existConnection: string[] = [];
      let generateStates: ApiState[] = [];
      states.forEach((state) => {
        if (!existConnection.includes(state.tuneCh.connection)) {
          existConnection.push(state.tuneCh.connection);
          generateStates.push(state);
        }
      });
      setShowStates(generateStates.filter(({ tuneCh }) => tuneCh.liveCnt));
    } else {
      setShowStates(states.filter(({ tuneCh }) => tuneCh.liveCnt));
    }
  };

  useEffect(() => {
    if ((states !== showStates && states.length > 0) || showStates.length > 0) {
      setStatesLogic(isUniqueConnection);
    }
  }, [states]);

  const handleOnClickUniqueConnection = () => {
    setIsUniqueConnection(!isUniqueConnection);
    setStatesLogic(!isUniqueConnection);
  };

  return (
    <>
      <DuplicateSection>
        <Button $active={isUniqueConnection} onClick={handleOnClickUniqueConnection}>
          UNIQUE CONNECTION
        </Button>
      </DuplicateSection>
      <Table isUniqueConnection={isUniqueConnection} states={showStates} />
    </>
  );
};

window.onload = () => {
  const rootDom = document.querySelector('#visualizar');
  if (rootDom) {
    const root = createRoot(rootDom);
    const { hostname, search, protocol } = location;
    const { PRODUCTION_DOMAIN, DEVELOPMENT_DOMAIN } = define;
    const talknAPI = (window as any).talknAPI;
    const uid = talknAPI.uid;

    const isAcceptOption = (protocol === 'https:' && hostname.startsWith(PRODUCTION_DOMAIN)) || hostname.startsWith(DEVELOPMENT_DOMAIN);
    const searchParams = new URLSearchParams(search);

    const isTuneSameCh = Boolean(isAcceptOption && searchParams.get('isTuneSameCh') === '1');
    const isTuneMultiCh = Boolean(isAcceptOption && searchParams.get('isTuneMultiCh') === '1');
    const options = { isTuneSameCh, isTuneMultiCh } as RequiredOptions;

    const callback = (states: ApiState[]) => root.render(<Layout uid={uid} states={states} options={options} />);
    talknAPI.onStates(callback);
    root.render(<Layout uid={uid} options={options} />);
  }
};

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 60px 0 80px;
  font-size: 14px;
  font-family: 'Noto Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
  letter-spacing: 1px;
  color: ${getRgba(colors.normalFont)};
  border-color: ${getRgba(colors.normalFont)};
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  background: ${getRgba(colors.bgLightGray)};
  user-select: none;
  border-bottom: 1px solid ${getRgba(colors.border)};
`;

const DuplicateSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 98%;
  margin: 0 1% 8px;
`;

const TuneCnt = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 100px;
  .limitPidCnt {
    margin-top: 58px;
    font-size: 14px;
  }
`;

const Uid = styled.div`
  margin-bottom: 4px;
`;

const OptionUl = styled.ul`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const OptionLi = styled.li<{ value: 0 | 1 }>`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-left: 1px solid ${getRgba(colors.border)};
  background: ${({ value }) => (value ? '#ddd' : 'slategray')};
  color: ${({ value }) => (value ? 'white' : '#fff')};
  cursor: pointer;
  transition: 200ms;

  a,
  a:link,
  a:visited,
  a:active {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: ${({ value }) => (value ? 'rgb(79, 174, 159)' : 'slategray')};
    color: ${({ value }) => (value ? '#eee' : '#fff')};
    text-decoration: none;
    transition: 200ms;
  }

  a:hover {
    background: ${({ value }) => (value ? 'slategray' : 'rgb(79, 174, 159)')};
    color: ${({ value }) => (value ? '#eee' : '#eee')};
  }
  &:nth-child(1) {
    border-left: 0;
  }
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  background: ${getRgba(colors.bgLightGray)};
  user-select: none;
  border-top: 1px solid ${getRgba(colors.border)};
`;

const Button = styled.button<{ $active: Boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  outline: none;
  border: 1px solid ${getRgba(colors.border)};
  background: ${({ $active }) => ($active ? getRgba(colors.theme) : 'slategray')};
  color: #eee;
  cursor: pointer;
  transition: 200ms;
  &:hover {
    background: ${({ $active }) => ($active ? 'slategray' : getRgba(colors.theme))};
  }
`;
