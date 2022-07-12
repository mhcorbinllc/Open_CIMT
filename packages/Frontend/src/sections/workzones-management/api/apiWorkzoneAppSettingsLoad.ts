import {dynaError} from "dyna-error";

import {
  IWorkzonesAppSettings,
  API_PATH_apiWorkzonesAppSettingGet,
  IApiWorkzonesAppSettingGetQueryRequest,
  IApiWorkzonesAppSettingGetResponse,
} from "mhc-server";

import {apiFetch} from "../../../api/apiFetch";

import {getOnline} from "../../../utils/getOnline";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";
import {
  browserDbAppSettingsSave,
  browserDbAppSettingsLoad,
} from "./browserDb/entities/appSettings";

import {IDataWithOfflineInfo} from "./interfaces";
import {EOfflineStatus} from "./interfaces";

export const apiWorkzoneAppSettingsLoad = async (companyId: string, userId: string): Promise<IDataWithOfflineInfo<IWorkzonesAppSettings>> => {
  return getOnline()
    ? apiWorkzoneAppSettingsLoadOnline(companyId, userId)
    : apiWorkzoneAppSettingsLoadOffline(companyId, userId);
};

const apiWorkzoneAppSettingsLoadOnline = async (companyId: string, userId: string): Promise<IDataWithOfflineInfo<IWorkzonesAppSettings>> => {
  const response = await apiFetch.request<void, IApiWorkzonesAppSettingGetResponse, IApiWorkzonesAppSettingGetQueryRequest>({path: API_PATH_apiWorkzonesAppSettingGet});
  browserDbAppSettingsSave({
    companyId,
    userId,
    appSettings: response.settings,
    externalImport: true,
  });
  return {
    offlineInfo: {
      status: EOfflineStatus.ACTUAL_VERSION,
      userMessage: '',
    },
    data: response.settings,
  };
};

const apiWorkzoneAppSettingsLoadOffline = async (companyId: string, userId: string): Promise<IDataWithOfflineInfo<IWorkzonesAppSettings>> => {
  checkOfflineUserSignedIn();
  const offlineAppSettings = await browserDbAppSettingsLoad(companyId, userId);
  if (!offlineAppSettings) {
    throw dynaError({
      code: 202104091106,
      message: 'There is not offlineAppSettings version in indexedDb with the app settings',
      userMessage: 'You are offline, and there are no saved app settings.\nYou must login and load the application with this user online before utilizing the offline features.',
    });
  }

  return {
    offlineInfo: {
      status: EOfflineStatus.OFFLINE_VERSION,
      userMessage: "Settings loaded from device's local memory.",
    },
    data: offlineAppSettings,
  };
};
