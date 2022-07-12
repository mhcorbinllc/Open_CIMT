import {IWorkzoneHistory} from "../interfaces/IWorkzoneHistory";

export const API_PATH_apiWorkzoneItemHistorySearch = '/services/apiWorkzoneItemHistorySearch';

export interface IApiWorkzoneItemHistorySearchGetQueryRequest {
  workzoneId: string;
  search: string;
  skip: string;
  limit: string;
}

export interface IApiWorkzoneItemHistorySearchGetResponse {
  workzones: IWorkzoneHistory[];
}
