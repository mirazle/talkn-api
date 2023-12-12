import Sequence from '@common/Sequence';

// TODO: any
export default (response: {[key: string | 'type']: any}) => {
  const type = `${Sequence.SERVER_TO_API_EMIT}${response.type}`;
  return { ...response, type };
};
