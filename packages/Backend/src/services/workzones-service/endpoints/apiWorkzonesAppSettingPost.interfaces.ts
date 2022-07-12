import {IWorkzonesAppSettings} from "../interfaces/IWorkzonesAppSettings";

export const API_PATH_apiWorkzonesAppSettingPost = '/services/workzones-management/settings';

export type IApiWorkzonesAppSettingPostBodyRequest = IWorkzonesAppSettings;

export interface IApiWorkzonesAppSettingPostResponse {
  ok: true;
}

