import {dynaError} from "dyna-error";

import {
  IWorkzone,
  API_PATH_apiWorkzoneItemUndeletePut,
  IApiWorkzoneItemUndeletePutBodyRequest,
  IApiWorkzoneItemUndeletePutResponse,
} from "mhc-server";

import {
  IDataWithOfflineInfo,
  EOfflineStatus,
} from "./interfaces";

import {apiFetch} from "../../../api/apiFetch";
import {getOnline} from "../../../utils/getOnline";
import {browserDbWorkzoneUpdate} from "./browserDb/entities/workzone/browserDbWorkzoneUpdate";
import {browserDbWorkzoneLoad} from "./browserDb/entities/workzone/browserDbWorkzoneLoad";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";

export const apiWorkzoneItemUndelete = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  return getOnline()
    ? apiWorkzoneItemUndeleteOnline(companyId, userId, workzoneId)
    : apiWorkzoneItemUndeleteOffline(companyId, userId, workzoneId);
};

const apiWorkzoneItemUndeleteOnline = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  const {workzone: onlineWorkzone} = await apiFetch.request<IApiWorkzoneItemUndeletePutBodyRequest, IApiWorkzoneItemUndeletePutResponse>({
    path: API_PATH_apiWorkzoneItemUndeletePut,
    method: 'PUT',
    body: {workzoneId},
  });

  browserDbWorkzoneUpdate({
    companyId,
    userId,
    workzone: onlineWorkzone,
    externalImport: true,
  });

  return {
    data: onlineWorkzone,
    offlineInfo: {
      status: EOfflineStatus.ACTUAL_VERSION,
      userMessage: '',
    },
  };
};

const apiWorkzoneItemUndeleteOffline = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  checkOfflineUserSignedIn();

  const offlineWorkzone = await browserDbWorkzoneLoad(companyId, userId, workzoneId);

  if (!offlineWorkzone) {
    throw dynaError({
      code: 202105121040,
      message: 'CIM not found in offline database to undelete it',
      userMessage: 'Internal error, please perform this undelete online only.',
    // Dev note: this could happen only the if the Offline DB is broken and lost this CIM.
    });
  }

  const now = Date.now();
  const updatedWozone: IWorkzone = {
    ...offlineWorkzone,
    updatedAt: now,
    deletedAt: 0,
  };

  const updateKey = await browserDbWorkzoneUpdate({
    companyId,
    userId,
    workzone: updatedWozone,
    externalImport: false,
  });

  if (!updateKey) {
    throw dynaError({
      code: 202105121041,
      message: 'CIM cannot be undeleted on offline database. Update key is returned as empty.',
      userMessage: 'Cannot undelete on local offline database.',
    // Dev note: this could happen only the if the Offline DB is broken and lost this CIM.
    });
  }

  return {
    data: updatedWozone,
    offlineInfo: {
      status: EOfflineStatus.UNDELETED_OFFLINE,
      userMessage: 'You are offline. CIM undeleted successfully offline.',
    },
  };
};

