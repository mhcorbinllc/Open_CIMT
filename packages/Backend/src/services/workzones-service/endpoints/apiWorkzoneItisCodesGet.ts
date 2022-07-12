import * as express from "express";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_ApiWorkzoneItisCodesGet,
  IApiWorkzoneItisCodesGetBodyRequest,
  IApiWorkzoneItisCodesGetResponse,
} from "./apiWorkzoneItisCodesGet.interfaces";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";

import {dmdb} from "../../../db/getDBs";
import {dbWorkzonesAppSettingsLoad} from "../db/dbWorkzonesAppSettingsLoad";

export const apiWorkzoneItisCodesGet = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzoneItisCodesGetBodyRequest, IApiWorkzoneItisCodesGetResponse>({
    expressApp,
    path: API_PATH_ApiWorkzoneItisCodesGet,
    method: 'GET',
    userHasAllRights: [],
    userHasAnyOfRights: Object.values(EWorkZonesManagementRights),
    validateQuery: null,
    validateBody: {},
    execute: async (
      {userAuth: {companyId}},
    ) => {
      const settings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
      return {
        itisCodes: settings.itisCodes,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      };
    },
  });
};
