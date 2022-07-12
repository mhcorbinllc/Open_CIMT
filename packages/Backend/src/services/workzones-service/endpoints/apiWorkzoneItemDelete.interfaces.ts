import {IWorkzone} from "../interfaces/IWorkzone";

export const API_PATH_apiWorkzoneItemDelete = '/services/workzones-management/item';

export interface IApiWorkzoneItemDeleteBodyRequest {
  workzoneId: string;
}

export interface IApiWorkzoneItemDeleteResponse {
  workzone: IWorkzone;
}
