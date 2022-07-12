import {IItisCode} from "../interfaces/IWorkzonesAppSettings";

export const API_PATH_ApiWorkzoneItisCodesGet = '/services/workzones-management/itis-codes';

export interface IApiWorkzoneItisCodesGetBodyRequest {
}

export interface IApiWorkzoneItisCodesGetResponse {
  itisCodes: IItisCode[];
  createdAt: number;
  updatedAt: number;
}
