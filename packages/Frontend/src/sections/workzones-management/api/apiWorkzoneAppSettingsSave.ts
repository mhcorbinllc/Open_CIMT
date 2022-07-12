import {
  IWorkzonesAppSettings,
  API_PATH_apiWorkzonesAppSettingPost,
  IApiWorkzonesAppSettingPostResponse,
  IApiWorkzonesAppSettingPostBodyRequest,
} from "mhc-server";

import {
  IDataWithOfflineInfo,
  EOfflineStatus,
} from "./interfaces";

import {apiFetch} from "../../../api/apiFetch";

import {getOnline} from "../../../utils/getOnline";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";
import {browserDbAppSettingsSave} from "./browserDb/entities/appSettings";

export const apiWorkzoneAppSettingsSave = async (companyId: string, userId: string, settings: IWorkzonesAppSettings): Promise<IDataWithOfflineInfo<void>> => {
  if (getOnline()) {
    await apiFetch.request<IApiWorkzonesAppSettingPostBodyRequest, IApiWorkzonesAppSettingPostResponse>({
      method: 'POST',
      path: API_PATH_apiWorkzonesAppSettingPost,
      body: settings,
    });
  }
  else {
    checkOfflineUserSignedIn();
  }

  await browserDbAppSettingsSave({
    companyId,
    userId,
    appSettings: settings,
    externalImport: getOnline(),
  });

  return getOnline()
    ? {
      offlineInfo: {
        status: EOfflineStatus.ACTUAL_VERSION,
        userMessage: '',
      },
      data: undefined,
    }
    : {
      offlineInfo: {
        status: EOfflineStatus.UPDATED_OFFLINE,
        userMessage: 'Saved offline.',
      },
      data: undefined,
    };
};
