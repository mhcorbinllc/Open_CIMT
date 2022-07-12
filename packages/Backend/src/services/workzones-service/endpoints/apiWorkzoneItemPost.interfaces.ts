import {IWorkzone} from "../interfaces/IWorkzone";

export const API_PATH_apiWorkzoneItemPost = '/services/workzones-management/item';

export type IApiWorkzoneItemPostBodyRequest = IWorkzone;

export interface IApiWorkzoneItemPostResponse {
  workzone: IWorkzone;
}

