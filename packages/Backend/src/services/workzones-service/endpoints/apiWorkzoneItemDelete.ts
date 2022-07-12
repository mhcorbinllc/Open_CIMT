import * as express from "express";
import {
  dynaError,
  IDynaError,
} from "dyna-error";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_apiWorkzoneItemDelete,
  IApiWorkzoneItemDeleteBodyRequest,
  IApiWorkzoneItemDeleteResponse,
} from "./apiWorkzoneItemDelete.interfaces";

import {
  apiConnectBroadcastDelete,
  IConnectResponse,
} from "../providers/connect";

import {dmdb} from "../../../db/getDBs";
import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {dbWorkzoneItemDeleteUndelete} from "../db/dbWorkzoneItemDeleteUndelete";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";
import {dbWorkzoneItemLoad} from "../db/dbWorkzoneItemLoad";
import {dbWorkzonesAppSettingsLoad} from "../db/dbWorkzonesAppSettingsLoad";
import {convertIWorkzoneToIConnectWorkzone} from "../interfaces/convertIWorkzoneToIConnectWorkzone";
import {IConnectWorkzone} from "../interfaces/IConnectWorkzone";
import {validateIConnectBroadcastResponse} from "../validations/validateIConnectBroadcastResponse";

export const apiWorkzoneItemDelete = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzoneItemDeleteBodyRequest, IApiWorkzoneItemDeleteResponse>({
    expressApp,
    path: API_PATH_apiWorkzoneItemDelete,
    method: 'DELETE',
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
    userHasAnyOfRights: [],
    advancedProtection: true,
    validateQuery: null,
    validateBody: {workzoneId: validateDataMethods.hasValueValidationMessage},
    execute: async (
      {
        body: {workzoneId},
        userAuth: {
          companyId,
          userId,
        },
      },
    ) => {
      const currentWorkzone = await dbWorkzoneItemLoad({
        dmdb,
        companyId,
        workzoneId,
      });

      if (!currentWorkzone) {
        throw dynaError({
          code: 202108021300,
          status: 404,
          message: 'CIM not found',
          userMessage: 'CIM not found.',
        });
      }

      if (currentWorkzone.kapschId > -1) {
        const workzoneAppSettings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);

        const kapschWorkzone: IConnectWorkzone = convertIWorkzoneToIConnectWorkzone({
          workzone: currentWorkzone,
          workzoneAppSettings,
        });

        const backendResponse: IConnectResponse = await apiConnectBroadcastDelete(kapschWorkzone);

        const backendResponseValidation = validateIConnectBroadcastResponse(backendResponse);

        if (backendResponseValidation) {
          const error = dynaError({
            // If this is occurred then the Node.JS is incompatible with the backend or the backend is currently broken.
            status: 503,
            code: 202108021301,
            message: `Broadcast Backend API response is invalid: ${backendResponseValidation}`,
            userMessage: 'CIM Broadcast Service has an internal error. Please contact the administrator.',
            data: {backendResponse},
          });
          console.error('apiWorkzoneItemBroadcastPost', {
            ...error,
            data: {
              message: `Broadcast Backend API response is invalid: ${backendResponseValidation}`,
              backendApiResponse: backendResponse,
            },
          } as IDynaError);
          throw error;
        }

        if (backendResponse.status.toLowerCase() !== 'success') {
          const error = dynaError({
            code: 202108021302,
            status: 503,
            message: 'Broadcast Backend API responded with error. (Check server logs for more)',
            userMessage: backendResponse.userError || 'Unknown delete broadcast CIM service error',
          });
          console.error('apiWorkzoneItemBroadcastPost', {
            ...error,
            data: {
              message: `Broadcast Backend API responded with status: [${backendResponse.status}] (in body)`,
              backendApiResponse: backendResponse,
            },
          } as IDynaError);
          throw error;
        }
      }

      const {workzone} = await dbWorkzoneItemDeleteUndelete({
        dmdb,
        companyId,
        userId,
        workzoneId,
        operation: 'delete',
      });

      if (!workzone) {
        throw dynaError({
          code: 202105120842,
          status: 404,
          message: 'CIM not found',
          userMessage: 'CIM not found.',
        });
      }

      return {workzone};
    },
  });
};
