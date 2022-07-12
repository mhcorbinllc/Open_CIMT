import {IConnectResponse} from "../providers/connect";

export const validateIConnectBroadcastResponse = (response: IConnectResponse): string => {
  if (response === undefined) return 'Backend response is undefined';
  if (response === null) return 'Backend response is null';
  if (typeof response !== 'object') return 'Backend response is not object';
  if (typeof response.status !== 'string') return 'Backend response "status" is not a string';
  if (!response.status) return 'Backend response "status" is empty string';
  if (typeof response.messageID !== 'number') return 'Backend response "messageID" is not a number';
  if (typeof response.updatedRSUs !== 'number') return 'Backend response "updatedRSUs" is not a number';
  return '';
};
