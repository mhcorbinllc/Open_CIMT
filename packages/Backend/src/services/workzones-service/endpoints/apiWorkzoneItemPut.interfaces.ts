import {IWorkzone} from "../interfaces/IWorkzone";

export const API_PATH_apiWorkzoneItemPut = '/services/workzones-management/item';

export type IApiWorkzoneItemPutBodyRequest = IWorkzone;

export interface IApiWorkzoneItemPutResponse {
  workzone: IWorkzone;
}
