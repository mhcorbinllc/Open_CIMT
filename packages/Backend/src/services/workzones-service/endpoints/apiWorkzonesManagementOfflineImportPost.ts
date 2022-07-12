import * as express from "express";
import {dynaError} from "dyna-error";

import {
  API_PATH_ApiWorkzonesManagementOfflineImportPost,
  IApiWorkzonesManagementOfflineImportPostBodyRequest,
  IApiWorkzonesManagementOfflineImportPostResponse,
  EOfflineAction,
} from "./apiWorkzonesManagementOfflineImportPost.interfaces";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";
import {IWorkzonesAppSettings} from "../interfaces/IWorkzonesAppSettings";
import {IWorkzone} from "../interfaces/IWorkzone";

import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

import {dmdb} from "../../../db/getDBs";
import {dbWorkzonesAppSettingsLoad} from "../db/dbWorkzonesAppSettingsLoad";
import {dbWorkzonesAppSettingsSave} from "../db/dbWorkzonesAppSettingsSave";
import {dbWorkzoneItemCreate} from "../db/dbWorkzoneItemCreate";
import {dbWorkzoneItemLoad} from "../db/dbWorkzoneItemLoad";
import {dbWorkzoneItemUpdate} from "../db/dbWorkzoneItemUpdate";
import {dbWorkzoneItemDeleteUndelete} from "../db/dbWorkzoneItemDeleteUndelete";

export const apiWorkzonesManagementOfflineImportPost = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzonesManagementOfflineImportPostBodyRequest, IApiWorkzonesManagementOfflineImportPostResponse>({
    expressApp,
    path: API_PATH_ApiWorkzonesManagementOfflineImportPost,
    method: 'POST',
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_VIEW],
    userHasAnyOfRights: [],
    validateQuery: null,
    validateBody: {
      collectionName:
        collectionName =>
          validateDataMethods.isOneOfTheValuesValidationMessage(
            collectionName,
            [
              "workzones",
              "workzoneAppSettings",
            ],
          ),
      doc: validateDataMethods.isObjectValidationMessage,
      offlineAction: offlineAction => validateDataMethods.isEnumValueValidationMessage(offlineAction, EOfflineAction),
    },
    execute: async (
      {
        body: {
          collectionName,
          offlineAction,
          doc,
        },
        userAuth: {
          companyId,
          userId,
          hasRight,
        },
      },
    ) => {
      switch (collectionName) {

        case 'workzoneAppSettings':
          switch (offlineAction) {

            case EOfflineAction.UPDATE:
              return await (async (): Promise<IApiWorkzonesManagementOfflineImportPostResponse> => {
                if (!hasRight(EWorkZonesManagementRights.WORKZONES_EDIT)) {
                  throw dynaError({
                    code: 202104271051,
                    status: 403,
                    message: 'User has no access to change CIMT App Settings',
                    userMessage: 'Access denied',
                  });
                }
                const updateWorkzoneAppSettings: IWorkzonesAppSettings = doc;
                const currentWorkzoneAppSettings = await dbWorkzonesAppSettingsLoad(dmdb, companyId, updateWorkzoneAppSettings.deviceId);
                if (process.env._debug_offlineMessages === 'true') {
                  console.log('DEBUG-OFFLINE: OFFLINE_workzoneAppSettings_UPDATE',
                    {
                      offlineIsNewer: currentWorkzoneAppSettings.updatedAt < updateWorkzoneAppSettings.updatedAt,
                      updateWorkzoneAppSettings,
                    },
                  );
                }
                if (currentWorkzoneAppSettings.updatedAt < updateWorkzoneAppSettings.updatedAt) {
                  await dbWorkzonesAppSettingsSave({
                    dmdb,
                    companyId,
                    workzoneAppSettings: updateWorkzoneAppSettings,
                    externalImport: true,
                    newerOnly: true,
                  });
                  return {applied: true};
                }
                else {
                  return {
                    applied: false,
                    noAppliedReason: "Server's app settings are newer",
                  };
                }
              })();

            case EOfflineAction.CREATE:
            case EOfflineAction.DELETE:
            default:
              throw dynaError({
                code: 202104271091,
                status: 400,
                message: `apiWorkzonesOfflineImport: Non supported offline action`,
              });
          }

        case 'workzones':
          switch (offlineAction) {

            case EOfflineAction.CREATE:
              return await (async (): Promise<IApiWorkzonesManagementOfflineImportPostResponse> => {
                if (!hasRight(EWorkZonesManagementRights.WORKZONES_EDIT)) {
                  throw dynaError({
                    code: 202104271052,
                    status: 403,
                    message: 'User has no access to create a CIM',
                    userMessage: 'Access denied',
                  });
                }
                const createWorkzone: IWorkzone = doc;
                const currentWorkzone = await dbWorkzoneItemLoad({
                  dmdb,
                  companyId,
                  workzoneId: createWorkzone.workzoneId,
                });
                if (currentWorkzone) {
                  throw dynaError({
                    code: 202104271057,
                    status: 400,
                    message: 'This workzoneId exists',
                    userMessage: 'This workzoneId exists.',
                    data: {workzoneId: createWorkzone.workzoneId},
                  });
                }
                const createdWorkzone = await dbWorkzoneItemCreate({
                  dmdb,
                  companyId,
                  userId,
                  workzone: createWorkzone,
                  externalImport: true,
                });
                if (process.env._debug_offlineMessages === 'true') {
                  console.log('DEBUG-OFFLINE: OFFLINE_workzone_CREATE',
                    JSON.parse(JSON.stringify({
                      errorDifferentWokzoneIdCreateCreated: createWorkzone.workzoneId !== createdWorkzone.workzoneId,
                      createWorkzone,
                      createdWorkzone,
                    })),
                  );
                }
                return {
                  applied: true,
                  updatedDoc: createdWorkzone,
                };
              })();

            case EOfflineAction.UPDATE:
              return await (async (): Promise<IApiWorkzonesManagementOfflineImportPostResponse> => {
                if (!hasRight(EWorkZonesManagementRights.WORKZONES_EDIT)) {
                  throw dynaError({
                    code: 202104271052,
                    status: 403,
                    message: 'User has no access to update a CIM',
                    userMessage: 'Access denied',
                  });
                }
                const updateWorkzone: IWorkzone = doc;
                const currentWorkzone = await dbWorkzoneItemLoad({
                  dmdb,
                  companyId,
                  workzoneId: updateWorkzone.workzoneId,
                });
                if (process.env._debug_offlineMessages === 'true') {
                  console.log('DEBUG-OFFLINE: OFFLINE_workzone_UPDATE',
                    JSON.parse(JSON.stringify({
                      updateWorkzone,
                      currentWorkzone,
                      doesnExistWillCreateANewOne: !currentWorkzone,
                    })),
                  );
                }
                if (currentWorkzone) {
                  // CIM exists in the DB, update it
                  if (currentWorkzone.updatedAt < updateWorkzone.updatedAt) {
                    const updated = await dbWorkzoneItemUpdate({
                      dmdb,
                      companyId,
                      userId,
                      workzone: updateWorkzone,
                      externalImport: true,
                      newerOnly: true,
                    });
                    return {
                      applied: updated,
                      noAppliedReason: !updated ? 'Not found to update it' : undefined,
                    };
                  }
                  else {
                    return {
                      applied: false,
                      noAppliedReason: "Server's version is newer",
                    };
                  }
                }
                else {
                  // CIM does NOT exist in the DB, create it
                  // This can happen only when for some reason the initial create offline action didn't happen
                  if (!hasRight(EWorkZonesManagementRights.WORKZONES_EDIT)) {
                    throw dynaError({
                      code: 202104271059,
                      status: 403,
                      message: 'User has no access to create a CIM',
                      userMessage: 'Access denied',
                    });
                  }
                  const createdWorkzone = await dbWorkzoneItemCreate({
                    dmdb,
                    companyId,
                    userId,
                    workzone: updateWorkzone,
                    externalImport: true,
                  });
                  return {
                    applied: true,
                    updatedDoc: createdWorkzone,
                  };
                }
              })();

            case EOfflineAction.DELETE:
              return await (async (): Promise<IApiWorkzonesManagementOfflineImportPostResponse> => {
                if (!hasRight(EWorkZonesManagementRights.WORKZONES_EDIT)) {
                  throw dynaError({
                    code: 202104271053,
                    status: 403,
                    message: 'User has no access to delete a CIM',
                    userMessage: 'Access denied',
                  });
                }
                const deleteWorkzone: IWorkzone = doc;
                const currentWorkzone = await dbWorkzoneItemLoad({
                  dmdb,
                  companyId,
                  workzoneId: deleteWorkzone.workzoneId,
                });
                if (!currentWorkzone) {
                  throw dynaError({
                    code: 202104271060,
                    status: 404,
                    message: 'Cannot find this CIM',
                    userMessage: 'CIM not found.',
                  });
                }
                if (process.env._debug_offlineMessages === 'true') {
                  console.log('DEBUG-OFFLINE: OFFLINE CIM DELETE',
                    JSON.parse(JSON.stringify({
                      currentWorkzone,
                      offlineIsNewer: currentWorkzone.updatedAt < deleteWorkzone.updatedAt,
                    })),
                  );
                }
                if (currentWorkzone.updatedAt < deleteWorkzone.updatedAt) {
                  const {
                    workzone: updatedWorkzone,
                    applied,
                  } = await dbWorkzoneItemDeleteUndelete({
                    dmdb,
                    companyId,
                    userId,
                    operation: 'delete',
                    workzoneId: deleteWorkzone.workzoneId,
                    externalImport: {
                      workzone: deleteWorkzone,
                      newerOnly: true,
                    },
                  });
                  return {
                    applied,
                    noAppliedReason: ((): string | undefined => {
                      if (applied) return;
                      if (!updatedWorkzone) return 'Not found. Cannot delete it.';
                      if (updatedWorkzone.updatedAt > deleteWorkzone.updatedAt) return "Server's version is newer";
                      return 'Unknown reason';
                    })(),
                  };
                }
                else {
                  return {
                    applied: false,
                    noAppliedReason: "Server's version is newer",
                  };
                }
              })();

            case EOfflineAction.UNDELETE:
              return await (async (): Promise<IApiWorkzonesManagementOfflineImportPostResponse> => {
                if (!hasRight(EWorkZonesManagementRights.WORKZONES_EDIT)) {
                  throw dynaError({
                    code: 2021042710534,
                    status: 403,
                    message: 'User has no access to undelete a CIM',
                    userMessage: 'Access denied',
                  });
                }
                const undeleteWorkzone: IWorkzone = doc;
                const currentWorkzone = await dbWorkzoneItemLoad({
                  dmdb,
                  companyId,
                  workzoneId: undeleteWorkzone.workzoneId,
                });
                if (!currentWorkzone) {
                  throw dynaError({
                    code: 202104271061,
                    status: 404,
                    message: 'Cannot find this CIM',
                    userMessage: 'CIM not found.',
                  });
                }
                if (process.env._debug_offlineMessages === 'true') {
                  console.log('DEBUG-OFFLINE: OFFLINE_workzone_UNDELETE',
                    JSON.parse(JSON.stringify({
                      currentWorkzone,
                      offlineIsNewer: currentWorkzone.updatedAt < undeleteWorkzone.updatedAt,
                    })),
                  );
                }
                if (currentWorkzone.updatedAt < undeleteWorkzone.updatedAt) {
                  const {
                    workzone: updatedWorkzone,
                    applied,
                  } = await dbWorkzoneItemDeleteUndelete({
                    dmdb,
                    companyId,
                    userId,
                    operation: 'undelete',
                    workzoneId: undeleteWorkzone.workzoneId,
                    externalImport: {
                      workzone: undeleteWorkzone,
                      newerOnly: true,
                    },
                  });
                  return {
                    applied,
                    noAppliedReason: ((): string | undefined => {
                      if (applied) return;
                      if (!updatedWorkzone) return 'Not found. Cannot undelete it.';
                      if (updatedWorkzone.updatedAt > undeleteWorkzone.updatedAt) return "Server's version is newer";
                      return 'Unknown reason';
                    })(),
                  };
                }
                else {
                  return {
                    applied: false,
                    noAppliedReason: "Server's version is newer",
                  };
                }
              })();

            default:
              throw dynaError({
                code: 202104271092,
                status: 400,
                message: `apiWorkzonesOfflineImport: Non supported offline action`,
              });
          }

        default:
          throw dynaError({
            code: 202104271023,
            status: 500,
            message: `apiWorkzonesOfflineImport: Internal error: Collection [${collectionName}] is not recognizable and it shouldn't pass the validation!`,
          });
      }
    },
  });
};
