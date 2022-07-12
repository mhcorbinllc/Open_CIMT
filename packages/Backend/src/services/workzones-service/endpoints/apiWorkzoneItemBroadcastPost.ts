import * as express from "express";

import {
  dynaError,
  IDynaError,
} from "dyna-error";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";
import {IConnectWorkzone} from "../interfaces/IConnectWorkzone";

import {
  API_PATH_ApiWorkzoneItemBroadcastPost,
  IApiWorkzoneItemBroadcastPostBodyRequest,
  IApiWorkzoneItemBroadcastPostResponse,
} from "./apiWorkzoneItemBroadcastPost.interfaces";

import {
  apiConnectBroadcastPost,
  IConnectResponse,
} from "../providers/connect";

import {dmdb} from "../../../db/getDBs";
import {secureEndpoint} from "../../user-authentication/secureEndpoint";

import {dbWorkzoneItemLoad} from "../db/dbWorkzoneItemLoad";
import {dbWorkzonesAppSettingsLoad} from "../db/dbWorkzonesAppSettingsLoad";
import {dbWorkzoneItemUpdate} from "../db/dbWorkzoneItemUpdate";

import {convertIWorkzoneToIConnectWorkzone} from "../interfaces/convertIWorkzoneToIConnectWorkzone";

import {
  validationEngine,
  validateDataMethods,
} from "core-library/dist/commonJs/validation-engine";
import {validateWorkzoneForBroadcast} from "../validations/validateWorkzoneForBroadcast";
import {validateIConnectBroadcastResponse} from "../validations/validateIConnectBroadcastResponse";

export const apiWorkzoneItemBroadcastPost = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzoneItemBroadcastPostBodyRequest, IApiWorkzoneItemBroadcastPostResponse>({
    expressApp,
    path: API_PATH_ApiWorkzoneItemBroadcastPost,
    method: 'POST',
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
    userHasAnyOfRights: [],
    advancedProtection: true,
    validateQuery: null,
    validateBody: {workzoneId: workzoneId => validateDataMethods.isValidTextValidationMessage(workzoneId, 2, 50)},
    execute: async (
      {
        body: {workzoneId},
        userAuth: {
          companyId,
          userId,
        },
      },
    ) => {
      const workzone = await dbWorkzoneItemLoad({
        dmdb,
        companyId,
        workzoneId,
      });

      const workzoneAppSettings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);

      if (!workzone) {
        const error = dynaError({
          code: 202105051891,
          status: 404,
          message: 'Not found',
          userMessage: 'CIM not found.',
          data: {workzoneId},
        });
        console.error(error);
        throw error;
      }

      if (workzone.deletedAt > 0) {
        throw dynaError({
          code: 202105051892,
          status: 400,
          message: "Cannot broadcast a deleted CIM.",
          userMessage: "Cannot broadcast a deleted CIM, undelete the CIM to broadcast.",
        });
      }

      const validationResult = validationEngine(workzone, validateWorkzoneForBroadcast);
      if (!validationResult.isValid) {
        const countErrors = validationResult.messages.length;
        throw dynaError({
          status: 400,
          message: 'The CIM with this id has validation error(s)',
          userMessage: `This CIM has ${countErrors} invalid field${countErrors ? 's' : ''}. Please fix ${countErrors ? 'them' : 'it'} and retry.`,
          validationErrors: validationResult,
        });
      }

      const connectWorkzone: IConnectWorkzone = convertIWorkzoneToIConnectWorkzone({
        workzone,
        workzoneAppSettings,
      });

      console.log('DEBUG; DEBUG-BROADCASTING_connectWorkzone', JSON.stringify(connectWorkzone, null, 2));

      const connectResponse: IConnectResponse = await apiConnectBroadcastPost(connectWorkzone);

      if (!connectResponse) {
        throw dynaError({ // 4TS, we validate the response anyway
          code: 202105051836,
          status: 503,
          message: 'Broadcast Backend API response is undefined or null',
          userMessage: 'CIM Broadcast Service is currently unavailable.',
        });
      }

      const backendResponseValidation = validateIConnectBroadcastResponse(connectResponse);
      if (backendResponseValidation) {
        const error = dynaError({
          // If this is occurred then the Node.JS is incompatible with the backend or the backend is currently broken.
          status: 503,
          code: 202105060911,
          message: `Broadcast Backend API response is invalid: ${backendResponseValidation}`,
          userMessage: 'CIM Broadcast Service has an internal error. Please contact the administrator.',
          data: {connectResponse},
        });
        console.error({
          ...error,
          data: {
            message: `Broadcast Backend API response is invalid: ${backendResponseValidation}`,
            connectResponse,
          },
        });
        throw error;
      }

      if (connectResponse.status.toLowerCase() !== 'success') {
        const error = dynaError({
          code: 202105051837,
          status: 503,
          message: 'Broadcast Backend API responded with error. (Check server logs for more)',
          userMessage: connectResponse.userError || 'Unknown broadcast service error',
        });
        console.error('apiWorkzoneItemBroadcastPost', {
          ...error,
          data: {
            message: `Broadcast Backend API responded with status: [${connectResponse.status}] (in body)`,
            connectResponse,
          },
        } as IDynaError);
        throw error;
      }

      const {
        messageID: kapschId,
        updatedRSUs,
      } = connectResponse;

      // Update the CIM's kapschId
      const updated = await dbWorkzoneItemUpdate({
        dmdb,
        companyId,
        userId,
        workzone: {
          ...workzone,
          kapschId,
        },
        historyName: `Broadcast KapschId ${kapschId} #broadcast`,
      });

      if (!updated) {
        throw dynaError({
          status: 500,
          code: 202105051957,
          message: 'CIM broadcast successfully but the record not updated with the kapsch id',
          userMessage: 'CIM broadcast successful but there is a DB error, please contact the administrator.',
          data: {
            workzone,
            kapschId,
          },
        });
      }
      else {
        // Double check Java API response
        if (workzone.kapschId !== kapschId) {
          console.error(dynaError({
            code: 202105051958,
            message: 'apiWorkzoneItemBroadcastPost: internal error: CIM broadcast successfully but Java API returned different kapschId than expected!',
            data: {
              workzone,
              resolvedKapschId: kapschId,
            },
          }));
        }
      }

      return {
        kapschId,
        updatedRSUs,
      };

    },
  });
};
