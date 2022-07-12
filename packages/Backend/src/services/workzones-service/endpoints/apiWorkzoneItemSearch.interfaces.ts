import {IWorkzone} from "../interfaces/IWorkzone";

export const API_PATH_apiWorkzoneItemSearch = '/services/workzones-management/items/search';

export interface IApiWorkzoneItemSearchGetQueryRequest {
  search: string;
  deleted: string;
  forEver: boolean | 'both';
  skip: string;
  limit: string;
  sortByFieldName: string;
  sortDirection: "0" | "1" | "-1";
}

export interface IApiWorkzoneItemSearchGetResponse {
  workzones: IWorkzone[];
}
