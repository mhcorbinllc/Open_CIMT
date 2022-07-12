import {IWorkzone} from "../interfaces/IWorkzone";

export const API_PATH_apiWorkzoneItemUndeletePut = '/services/workzones-management/item/undelete';

export interface IApiWorkzoneItemUndeletePutBodyRequest {
  workzoneId: string;
}

export interface IApiWorkzoneItemUndeletePutResponse {
  workzone: IWorkzone;
}
