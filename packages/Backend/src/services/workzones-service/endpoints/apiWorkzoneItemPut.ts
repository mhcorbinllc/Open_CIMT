import * as express from "express";
import {dynaError} from "dyna-error";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_apiWorkzoneItemPut,
  IApiWorkzoneItemPutBodyRequest,
  IApiWorkzoneItemPutResponse,
} from "./apiWorkzoneItemPut.interfaces";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {validateWorkzoneForUpdate} from "../validations/validateWorkzoneForUpdate";

import {dmdb} from "../../../db/getDBs";
import {dbWorkzoneItemUpdate} from "../db/dbWorkzoneItemUpdate";
import {dbWorkzoneItemLoad} from "../db/dbWorkzoneItemLoad";

export const apiWorkzoneItemPut = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzoneItemPutBodyRequest, IApiWorkzoneItemPutResponse>({
    expressApp,
    path: API_PATH_apiWorkzoneItemPut,
    method: 'PUT',
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
    userHasAnyOfRights: [],
    advancedProtection: true,
    validateQuery: null,
    validateBody: validateWorkzoneForUpdate,
    execute: async (
      {
        body: workzone,
        userAuth: {
          companyId,
          userId,
        },
      },
    ) => {
      await dbWorkzoneItemUpdate({
        dmdb,
        companyId,
        userId,
        workzone,
      });

      const updatedWorkzone = await dbWorkzoneItemLoad({
        dmdb,
        companyId,
        workzoneId: workzone.workzoneId,
      });
      if (!updatedWorkzone) throw dynaError('Internal error, cannot find update wz'); // 4TS, this cannot happen

      return {workzone: updatedWorkzone};
    },
  });
};
