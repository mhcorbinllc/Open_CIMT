import {dynaError} from "dyna-error";

import {
  IWorkzone,
  API_PATH_apiWorkzoneItemGet,
  IApiWorkzoneItemGetQueryRequest,
  IApiWorkzoneItemGetResponse,
} from "mhc-server";

import {
  EOfflineStatus,
  IDataWithOfflineInfo,
} from "./interfaces";

import {apiFetch} from "../../../api/apiFetch";
import {getOnline} from "../../../utils/getOnline";
import {checkOfflineUserSignedIn} from "../../user-authnentication/api/localstorageSignState";
import {browserDbWorkzoneLoad} from "./browserDb/entities/workzone/browserDbWorkzoneLoad";
import {browserDbWorkzoneUpdate} from "./browserDb/entities/workzone/browserDbWorkzoneUpdate";
import {cimDefreezeDates} from "./utils/cimDefreezeDates";

export const apiWorkzoneItemGet = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  const item = await (
    getOnline()
      ? apiWorkzoneItemGetOnline(companyId, userId, workzoneId)
      : apiWorkzoneItemGetOffline(companyId, userId, workzoneId)
  );
  return {
    ...item,
    data: cimDefreezeDates(item.data),
  };
};

const apiWorkzoneItemGetOnline = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  let onlineWorkzone: IWorkzone | null = null;
  try {
    const response = await apiFetch.request<void, IApiWorkzoneItemGetResponse, IApiWorkzoneItemGetQueryRequest>({
      path: API_PATH_apiWorkzoneItemGet,
      method: 'GET',
      query: {workzoneId},
    });
    onlineWorkzone = response.workzone;
  }
  catch (e) {
    const error = e as any;
    if (error.status !== 404) throw e; // Propagate all errors, except the 404 not found because we need it.
  }

  const offlineWorkzone = await browserDbWorkzoneLoad(companyId, userId, workzoneId);
  if (
    (offlineWorkzone && !onlineWorkzone)
    || (offlineWorkzone && onlineWorkzone && offlineWorkzone.updatedAt > onlineWorkzone.updatedAt)
  ) {
    offlineWorkzone.start = new Date(offlineWorkzone.start);
    offlineWorkzone.end = new Date(offlineWorkzone.end);
    return {
      data: offlineWorkzone,
      offlineInfo: {
        status: EOfflineStatus.OFFLINE_VERSION,
        userMessage: 'This is your version that still is not saved on server.',
      },
    };
  }

  if (!onlineWorkzone) {
    throw dynaError({
      code: 202104230959,
      message: 'Online CIM not found, and there is no offline also',
      userMessage: 'CIM not found (online and offline).',
    });
  }

  browserDbWorkzoneUpdate({
    companyId,
    userId,
    workzone: onlineWorkzone,
    externalImport: true,
  });

  onlineWorkzone.start = new Date(onlineWorkzone.start);
  onlineWorkzone.end = new Date(onlineWorkzone.end);
  return {
    data: onlineWorkzone,
    offlineInfo: {
      status: EOfflineStatus.ACTUAL_VERSION,
      userMessage: '',
    },
  };
};

const apiWorkzoneItemGetOffline = async (companyId: string, userId: string, workzoneId: string): Promise<IDataWithOfflineInfo<IWorkzone>> => {
  checkOfflineUserSignedIn();
  const workzone = await browserDbWorkzoneLoad(companyId, userId, workzoneId);
  if (!workzone) {
    throw dynaError({
      code: 202104151053,
      status: 404,
      message: `CIM with id: ${workzoneId} doesn't exist in indexedDB`,
      userMessage: "You are offline, and this CIM is not loaded on this device.",
    });
  }
  return {
    data: workzone,
    offlineInfo: {
      status: EOfflineStatus.OFFLINE_VERSION,
      userMessage: 'You are offline. This CIM loaded from device.',
    },
  };
};
