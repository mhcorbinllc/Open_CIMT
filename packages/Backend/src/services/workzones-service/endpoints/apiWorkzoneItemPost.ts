import * as express from "express";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_apiWorkzoneItemPost,
  IApiWorkzoneItemPostBodyRequest,
  IApiWorkzoneItemPostResponse,
} from "./apiWorkzoneItemPost.interfaces";

import {dmdb} from "../../../db/getDBs";
import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {validateWorkzoneForCreate} from "../validations/validateWorkzoneForCreate";
import {dbWorkzoneItemCreate} from "../db/dbWorkzoneItemCreate";

export const apiWorkzoneItemPost = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzoneItemPostBodyRequest, IApiWorkzoneItemPostResponse>({
    expressApp,
    path: API_PATH_apiWorkzoneItemPost,
    method: 'POST',
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
    userHasAnyOfRights: [],
    advancedProtection: true,
    validateQuery: null,
    validateBody: validateWorkzoneForCreate,
    execute: async (
      {
        body: workzone,
        userAuth,
      },
    ) => {
      const savedWorkzone = await dbWorkzoneItemCreate({
        dmdb,
        companyId: userAuth.companyId,
        userId: userAuth.userId,
        workzone,
      });
      return {workzone: savedWorkzone};
    },
  });
};
