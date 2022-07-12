import * as express from "express";
import {dynaError} from "dyna-error";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_apiWorkzoneItemUndeletePut,
  IApiWorkzoneItemUndeletePutBodyRequest,
  IApiWorkzoneItemUndeletePutResponse,
} from "./apiWorkzoneItemUndelete.interfaces";

import {dmdb} from "../../../db/getDBs";
import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {dbWorkzoneItemDeleteUndelete} from "../db/dbWorkzoneItemDeleteUndelete";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

export const apiWorkzoneItemUndelete = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzoneItemUndeletePutBodyRequest, IApiWorkzoneItemUndeletePutResponse>({
    expressApp,
    path: API_PATH_apiWorkzoneItemUndeletePut,
    method: 'PUT',
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
      const {workzone} = await dbWorkzoneItemDeleteUndelete({
        dmdb,
        companyId,
        userId,
        workzoneId,
        operation: 'undelete',
      });

      if (!workzone) {
        throw dynaError({
          code: 202108021306,
          status: 404,
          message: 'CIM not found to undelete it',
          userMessage: 'CIM not found.',
        });
      }

      return {workzone};
    },
  });
};
