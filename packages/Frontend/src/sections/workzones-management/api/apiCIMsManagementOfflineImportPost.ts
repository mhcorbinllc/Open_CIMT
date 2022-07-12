import {IDynaError} from "dyna-error";
import {dynaSwitch} from "dyna-switch";

import {
  API_PATH_ApiWorkzonesManagementOfflineImportPost,
  IApiWorkzonesManagementOfflineImportPostBodyRequest,
  IApiWorkzonesManagementOfflineImportPostResponse,
  EOfflineAction,
} from "mhc-server";

import {apiFetch} from "../../../api/apiFetch";
import {getBrowserDbWorkzonesOfflineUploadLogCollection} from "./browserDb/entities/workzoneOfflineUploadLog/getBrowserDbWorkzonesOfflineUploadLogCollection";

export const apiCIMsManagementOfflineImportPost = async (
  {
    companyId,
    userId,
    collectionName,
    doc,
    offlineAction,
  }: {
    companyId: string;
    userId: string;
    collectionName: 'cimtAppSettings' | 'cims';
    doc: any;
    offlineAction: EOfflineAction;
  },
): Promise<IApiWorkzonesManagementOfflineImportPostResponse | null> => {
  const logCollection = getBrowserDbWorkzonesOfflineUploadLogCollection(companyId, userId);

  const backendCollectionName = dynaSwitch<'workzoneAppSettings' | 'workzones', 'cimtAppSettings' | 'cims'> (
    collectionName,
    'workzones',
    {
      cimtAppSettings: 'workzoneAppSettings',
      cims: 'workzones',
    },
  );

  let response: IApiWorkzonesManagementOfflineImportPostResponse | null = null;
  let success = false;
  let error: IDynaError | null = null;

  if (localStorage.getItem('_debug_offlineMessages') === 'true') {
    console.log('DEBUG-OFFLINE: UPLOADING', {
      collectionName,
      doc,
      offlineAction,
    });
  }

  try {
    response = await apiFetch.request<IApiWorkzonesManagementOfflineImportPostBodyRequest, IApiWorkzonesManagementOfflineImportPostResponse>({
      path: API_PATH_ApiWorkzonesManagementOfflineImportPost,
      method: 'POST',
      body: {
        collectionName: backendCollectionName,
        doc,
        offlineAction,
      },
    });
    success = true;
  }
  catch (e) {
    console.error('apiCIMsManagementOfflineImportPost', e);
    error = e;
  }

  if (error && !error.status) {
    // This is error is not from server, propagate to stop the upload.
    // Most likely the application cannot communicate with the server although the app is online.
    throw error;
  }

  await logCollection.update({
    logId: undefined,
    collectionName,
    doc,
    success,
    applied: response ? response.applied : false,
    noAppliedReason: response ? response.noAppliedReason : '',
    error: error
      ? {
        message: error.message || 'Unknown error',
        userMessage: error.userMessage || 'Unknown error',
      }
      : null,
  });

  return response;
};
