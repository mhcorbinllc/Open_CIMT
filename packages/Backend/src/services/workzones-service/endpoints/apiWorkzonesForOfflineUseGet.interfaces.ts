import {IWorkzone} from "../interfaces/IWorkzone";

export const API_PATH_ApiWorkzonesForOfflineUseGet = '/services/apiWorkzonesForOfflineUseGet';

export interface IApiWorkzonesForOfflineUseGetQueryRequest {
  lastMonths: number; // Get the CIMs created in lastMonths
  skip: number;
  limit: number;
}

export interface IApiWorkzonesForOfflineUseGetResponse {
  workzones: IWorkzone[];
}
