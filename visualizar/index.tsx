import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { createRoot } from 'react-dom/client';
import ApiState from '../src/state';
import { RequiredOptions, limitPidCnt } from '../src/wssWorker/StoresDispatcher';
import define from '../common/src/define';

import Table from './components/table';
import { colors, getRgba } from './styles';
import Button from './components/Button';

const { PRODUCTION_DOMAIN, DEVELOPMENT_DOMAIN } = define;

type Props = {
  uid: string;
  options: RequiredOptions;
  sessionStore: string;
  talknAPI: any;
  states?: ApiState[];
};

const storeOptions = [
  { label: '-', value: '' },
  { label: 'STORE A', value: 'A' },
  { label: 'STORE B', value: 'B' },
  { label: 'STORE C', value: 'C' },
  { label: 'STORE D', value: 'D' },
  { label: 'STORE E', value: 'E' },
];

const Layout: React.FC<Props> = ({ uid, states, options, sessionStore, talknAPI }) => {
  const inputTuneRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleOnKeyDownTune = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget as HTMLButtonElement;
    if (event.key === 'Enter') {
      talknAPI.tune(value);
    }
  };

  const handleOnClickTune = () => {
    if (inputTuneRef.current) {
      const elm = inputTuneRef.current as HTMLInputElement;
      talknAPI.tune(elm.value);
    }
  };

  useEffect(() => {
    if (states && isCapturing && sessionStore) {
      const connections = states.map((state, i) => state.tuneCh.connection);
      sessionStorage.setItem(`talknApiVisualizer:${sessionStore}`, JSON.stringify(connections));
    }
  }, [states, isCapturing]);

  return (
    <Container>
      <Header>talkn api visualizer</Header>
      <TuneCnt>
        {states ? states.length : 0}
        <span className="limitPidCnt">/{limitPidCnt}</span>
      </TuneCnt>
      <Uid>{uid}</Uid>
      <OptionMenu options={options}></OptionMenu>

      <SelectSessionStore
        options={options}
        sessionStore={sessionStore}
        talknAPI={talknAPI}
        states={states}
        isCapturing={isCapturing}
        setIsCapturing={setIsCapturing}
      />
      <Visualizar states={states} />
      <Footer>
        <span>CH</span>
        <Input ref={inputTuneRef} type="text" onKeyDown={handleOnKeyDownTune} />
        <Button onClick={handleOnClickTune}>TUNE</Button>
      </Footer>
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

type SelectSessionStoreProps = {
  talknAPI: any;
  sessionStore: string;
  options: RequiredOptions;
  states?: ApiState[];
  isCapturing: boolean;
  setIsCapturing: React.Dispatch<React.SetStateAction<boolean>>;
};

const SelectSessionStore: React.FC<SelectSessionStoreProps> = ({
  talknAPI,
  options,
  sessionStore,
  states,
  isCapturing,
  setIsCapturing,
}) => {
  const { isTuneMultiCh, isTuneSameCh } = options;
  const handleOnClickCapturing = () => {
    if (sessionStore) {
      setIsCapturing(!isCapturing);
    }
  };
  const handleOnClickClear = () => {
    if (sessionStore) {
      sessionStorage.setItem(`talknApiVisualizer:${sessionStore}`, '');
      location.reload();
    }
  };
  const handleOnChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const elm = e.target as HTMLSelectElement;
    location.href = `?isTuneSameCh=${Number(isTuneSameCh)}&isTuneMultiCh=${Number(isTuneMultiCh)}&sessionStore=${elm.value}`;
  };

  return (
    <CustomViewSection>
      <Select onChange={handleOnChangeSelect} disabled={isCapturing} defaultValue={sessionStore}>
        {storeOptions.map((radio) => (
          <option key={radio.value} value={radio.value}>
            {radio.label}
          </option>
        ))}
      </Select>
      <Button active bgHighlight theme="attention" onClick={handleOnClickCapturing} disabled={sessionStore === ''}>
        {isCapturing ? '⚫︎ CAPTURING' : '◯ CAPTURE'}
      </Button>
      <Button active bgHighlight theme="darkBlue" onClick={handleOnClickClear} disabled={isCapturing || sessionStore === ''}>
        ■ CLEAR
      </Button>
    </CustomViewSection>
  );
};

type DuplicateProps = {
  states?: ApiState[];
};

const Visualizar: React.FC<DuplicateProps> = ({ states = [] }) => {
  const searchInputRef = useRef(null);
  const [isUniqueConnection, setIsUniqueConnection] = useState(true);
  const [filterConnectionInput, setFilterConnectionInput] = useState('');
  const [showStates, setShowStates] = useState(states);

  const setStatesLogic = () => {
    let fixStatus = states;
    if (isUniqueConnection) {
      const existConnection: string[] = [];
      let generateStates: ApiState[] = [];
      states.forEach((state) => {
        if (!existConnection.includes(state.tuneCh.connection)) {
          existConnection.push(state.tuneCh.connection);
          generateStates.push(state);
        }
        fixStatus = generateStates;
      });
    }

    if (filterConnectionInput) {
      fixStatus = fixStatus.filter((fs) => fs.tuneCh.connection.startsWith(filterConnectionInput));
    }
    setShowStates(fixStatus.filter(({ tuneCh }) => tuneCh.liveCnt));
  };

  useEffect(() => {
    setStatesLogic();
  }, [isUniqueConnection, filterConnectionInput]);

  useEffect(() => {
    if ((states !== showStates && states.length > 0) || showStates.length > 0) {
      setStatesLogic();
    }
  }, [states]);

  const handleOnChangefilterConnection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const elm = e.target as HTMLInputElement;
    setFilterConnectionInput(elm.value);
  };

  const handleOnClickUniqueConnection = () => {
    setIsUniqueConnection(!isUniqueConnection);
  };

  return (
    <>
      <CustomViewSection>
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="filter connection"
          onChange={handleOnChangefilterConnection}
          value={filterConnectionInput}
        />

        <Button active={isUniqueConnection} onClick={handleOnClickUniqueConnection}>
          UNIQUE CONNECTION
        </Button>
      </CustomViewSection>

      <Table isUniqueConnection={isUniqueConnection} states={showStates} />
    </>
  );
};

window.onload = () => {
  const rootDom = document.querySelector('#visualizar');
  if (rootDom) {
    const root = createRoot(rootDom);
    const { hostname, search, protocol } = location;
    const talknAPI = (window as any).talknAPI;
    const uid = talknAPI.uid;

    const isAcceptOption = true;
    const searchParams = new URLSearchParams(search);
    const isTuneSameCh = Boolean(isAcceptOption && searchParams.get('isTuneSameCh') === '1');
    const isTuneMultiCh = Boolean(isAcceptOption && searchParams.get('isTuneMultiCh') === '1');
    const options = { isTuneSameCh, isTuneMultiCh } as RequiredOptions;
    const sessionStore = String(searchParams.get('sessionStore'));
    if (sessionStore) {
      const item = sessionStorage.getItem(`talknApiVisualizer:${sessionStore}`);
      if (item) {
        const connections = JSON.parse(item);
        for (const i in connections) {
          talknAPI.tune(connections[i]);
        }
      }
    }

    const callback = (states: ApiState[]) =>
      root.render(<Layout uid={uid} states={states} talknAPI={talknAPI} options={options} sessionStore={sessionStore} />);

    talknAPI.onStates(callback);

    root.render(<Layout uid={uid} options={options} talknAPI={talknAPI} sessionStore={sessionStore} />);
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
  font-weight: 300;
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

const CustomViewSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 98%;
  margin: 8px;
  gap: 8px;
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
    background: ${({ value }) => (value ? getRgba(colors.theme) : 'slategray')};
    color: ${({ value }) => (value ? '#eee' : '#fff')};
    text-decoration: none;
    transition: 200ms;
  }

  a:hover {
    background: ${({ value }) => (value ? 'slategray' : getRgba(colors.theme))};
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

  span {
    margin: 0 8px 0 16px;
    font-weight: 400;
  }
`;

const Input = styled.input`
  flex: 1 1 auto;
  border-radius: 8px;
  outline: none;
  line-height: 20px;
  border: 0;
  padding: 8px 16px;
  margin: 0 8px;
  color: ${getRgba(colors.normalFont)};
  letter-spacing: 1px;
`;

const Select = styled.select`
  padding: 8px 16px 8px 8px;
  border-radius: 8px;
`;
