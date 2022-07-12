import {
  IWorkzone,
  API_PATH_apiWorkzoneItemPut,
  IApiWorkzoneItemPutBodyRequest,
  IApiWorkzoneItemPutResponse,
} from "mhc-server";

import {IDataWithOfflineInfo} from "./interfaces";
import {EOfflineStatus} from "./interfaces";

import {apiFetch} from "../../../api/apiFetch";
import {getOnline} from "../../../utils/getOnline";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";
import {browserDbWorkzoneUpdate} from "./browserDb/entities/workzone/browserDbWorkzoneUpdate";
import {cimDefreezeDates} from "./utils/cimDefreezeDates";

export const apiWorkzoneItemPut = async (companyId: string, userId: string, workzone: IWorkzone): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  const result = await (getOnline()
    ? apiWorkzoneItemPutOnline(companyId, userId, workzone)
    : apiWorkzoneItemPutOffline(companyId, userId, workzone)
  );
  return {
    ...result,
    data: cimDefreezeDates(result.data),
  };
};

const apiWorkzoneItemPutOnline = async (companyId: string, userId: string, workzone: IWorkzone): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  const response = await apiFetch.request<IApiWorkzoneItemPutBodyRequest, IApiWorkzoneItemPutResponse>({
    path: API_PATH_apiWorkzoneItemPut,
    method: 'PUT',
    body: workzone,
  });

  browserDbWorkzoneUpdate({
    companyId,
    userId,
    workzone: response.workzone,
    externalImport: true,
  });

  return {
    data: response.workzone,
    offlineInfo: {
      status: EOfflineStatus.ACTUAL_VERSION,
      userMessage: '',
    },
  };
};

const apiWorkzoneItemPutOffline = async (companyId: string, userId: string, workzone: IWorkzone): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  checkOfflineUserSignedIn();
  await browserDbWorkzoneUpdate({
    companyId,
    userId,
    workzone,
    externalImport: false,
  });
  return {
    data: {...workzone},
    offlineInfo: {
      status: EOfflineStatus.OFFLINE_VERSION,
      userMessage: 'You are offline. Your changes saved successfully offline.',
    },
  };
};
