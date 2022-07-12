import {IWorkzonesAppSettings} from "../interfaces/IWorkzonesAppSettings";

export const API_PATH_apiWorkzonesAppSettingGet = '/services/workzones-management/settings';

export interface IApiWorkzonesAppSettingGetQueryRequest {
}

export interface IApiWorkzonesAppSettingGetResponse {
  settings: IWorkzonesAppSettings;
}

