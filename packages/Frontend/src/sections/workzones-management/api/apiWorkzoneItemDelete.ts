import {dynaError} from "dyna-error";

import {
  IWorkzone,
  API_PATH_apiWorkzoneItemDelete,
  IApiWorkzoneItemDeleteBodyRequest,
  IApiWorkzoneItemDeleteResponse,
} from "mhc-server";

import {IDataWithOfflineInfo} from "./interfaces";
import {EOfflineStatus} from "./interfaces";

import {apiFetch} from "../../../api/apiFetch";
import {getOnline} from "../../../utils/getOnline";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";
import {browserDbWorkzoneUpdate} from "./browserDb/entities/workzone/browserDbWorkzoneUpdate";
import {browserDbWorkzoneLoad} from "./browserDb/entities/workzone/browserDbWorkzoneLoad";

export const apiWorkzoneItemDelete = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  return getOnline()
    ? apiWorkzoneItemDeleteOnline(companyId, userId, workzoneId)
    : apiWorkzoneItemDeleteOffline(companyId, userId, workzoneId);
};

const apiWorkzoneItemDeleteOnline = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  const {workzone: onlineWorkzone} = await apiFetch.request<IApiWorkzoneItemDeleteBodyRequest, IApiWorkzoneItemDeleteResponse>({
    path: API_PATH_apiWorkzoneItemDelete,
    method: 'DELETE',
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

const apiWorkzoneItemDeleteOffline = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  checkOfflineUserSignedIn();

  const offlineWorkzone = await browserDbWorkzoneLoad(companyId, userId, workzoneId);

  if (!offlineWorkzone) {
    throw dynaError({
      code: 202105121050,
      message: 'CIM not found in offline database to delete it',
      userMessage: 'Internal error, please perform this delete online only.',
    // Dev note: this could happen only the if the Offline DB is broken and lost this CIM.
    });
  }

  const now = Date.now();
  const updatedWorkzone: IWorkzone = {
    ...offlineWorkzone,
    updatedAt: now,
    deletedAt: now,
  };

  const updateKey = await browserDbWorkzoneUpdate({
    companyId,
    userId,
    workzone: updatedWorkzone,
    externalImport: false,
  });

  if (!updateKey) {
    throw dynaError({
      code: 202105121051,
      message: 'CIM cannot be delete on offline database. Update key is returned as empty.',
      userMessage: 'Cannot delete on local offline database.',
    // Dev note: this could happen only the if the Offline DB is broken and lost this CIM.
    });
  }

  return {
    data: updatedWorkzone,
    offlineInfo: {
      status: EOfflineStatus.DELETED_OFFLINE,
      userMessage: 'You are offline. CIM deleted successfully offline.',
    },
  };
};
