import {dynaError} from "dyna-error";

import {
  IWorkzone,
  API_PATH_apiWorkzoneItemPost,
  IApiWorkzoneItemPostBodyRequest,
  IApiWorkzoneItemPostResponse,
} from "mhc-server";

import {apiFetch} from "../../../api/apiFetch";
import {
  IDataWithOfflineInfo,
  EOfflineStatus,
} from "./interfaces";

import {getOnline} from "../../../utils/getOnline";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";

import {browserDbWorkzoneLoad} from "./browserDb/entities/workzone/browserDbWorkzoneLoad";
import {browserDbWorkzoneUpdate} from "./browserDb/entities/workzone/browserDbWorkzoneUpdate";

export const apiWorkzoneItemPost = async (companyId: string, userId: string, workzone: IWorkzone): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  return getOnline()
    ? apiWorkzoneItemPostOnline(companyId, userId, workzone)
    : apiWorkzoneItemPostOffline(companyId, userId, workzone);
};

const apiWorkzoneItemPostOnline = async (companyId: string, userId: string, workzone: IWorkzone): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  const response = await apiFetch.request<IApiWorkzoneItemPostBodyRequest, IApiWorkzoneItemPostResponse>({
    path: API_PATH_apiWorkzoneItemPost,
    method: 'POST',
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
      userMessage: 'Created online.',
    },
  };
};

const apiWorkzoneItemPostOffline = async (companyId: string, userId: string, workzone_: IWorkzone): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  checkOfflineUserSignedIn();

  const workzone = {
    ...workzone_,
    workzoneId: '',
  };

  const workzoneId = await browserDbWorkzoneUpdate({
    companyId,
    userId,
    workzone,
    externalImport: false,
  });

  if (!workzoneId) {
    throw dynaError({
      code: 202104221151,
      message: 'apiCIMItemPostOffline: Internal error: cannot create in Offline DB the CIM.',
      userMessage: 'You are offline and for some reason the CIM cannot be saved on this device!',
    });
  }

  const createdWorkzone = await browserDbWorkzoneLoad(companyId, userId, workzoneId);

  if (!createdWorkzone) {
    throw dynaError({
      code: 202104221152,
      message: 'apiCIMItemPostOffline: Internal error: cannot load the just created in Offline DB, CIM',
      userMessage: 'You are offline and for some reason the CIM cannot be saved on this device!',
    });
  }

  return {
    data: createdWorkzone,
    offlineInfo: {
      status: EOfflineStatus.CREATED_OFFLINE,
      userMessage: 'Created offline on this device.',
    },
  };
};
