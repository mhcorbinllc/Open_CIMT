import * as express from "express";
import {dynaError} from "dyna-error";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";
import {
  API_PATH_apiWorkzoneItemGet,
  IApiWorkzoneItemGetQueryRequest,
  IApiWorkzoneItemGetResponse,
} from "./apiWorkzoneItemGet.interfaces";

import {dmdb} from "../../../db/getDBs";
import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {dbWorkzoneItemLoad} from "../db/dbWorkzoneItemLoad";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

export const apiWorkzoneItemGet = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<null, IApiWorkzoneItemGetResponse, IApiWorkzoneItemGetQueryRequest>({
    expressApp,
    path: API_PATH_apiWorkzoneItemGet,
    method: 'GET',
    userHasAllRights: [],
    userHasAnyOfRights: Object.values(EWorkZonesManagementRights),
    validateQuery: {workzoneId: validateDataMethods.hasValueValidationMessage},
    validateBody: null,
    execute: async (
      {
        query: {workzoneId},
        userAuth: {companyId},
      },
    ) => {
      const workzone = await dbWorkzoneItemLoad({
        dmdb,
        companyId,
        workzoneId,
      });

      if (!workzone) {
        throw dynaError({
          code: 202102051520,
          status: 404,
          message: 'CIM not found',
          userMessage: 'CIM not found.',
        });
      }

      return {workzone};
    },
  });
};
