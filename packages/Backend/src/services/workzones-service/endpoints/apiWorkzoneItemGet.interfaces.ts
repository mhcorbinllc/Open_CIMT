import {IWorkzone} from "../interfaces/IWorkzone";

export const API_PATH_apiWorkzoneItemGet = '/services/workzones-management/item';

export interface IApiWorkzoneItemGetQueryRequest {
  workzoneId: string;
}

export interface IApiWorkzoneItemGetResponse {
  workzone: IWorkzone;
}

