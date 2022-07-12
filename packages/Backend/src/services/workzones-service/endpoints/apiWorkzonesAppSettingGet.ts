import * as express from "express";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_apiWorkzonesAppSettingGet,
  IApiWorkzonesAppSettingGetQueryRequest,
  IApiWorkzonesAppSettingGetResponse,
} from "./apiWorkzonesAppSettingGet.interfaces";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";

import {dmdb} from "../../../db/getDBs";
import {dbWorkzonesAppSettingsLoad} from "../db/dbWorkzonesAppSettingsLoad";

export const apiWorkzonesAppSettingGet = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<null, IApiWorkzonesAppSettingGetResponse, IApiWorkzonesAppSettingGetQueryRequest>({
    expressApp,
    path: API_PATH_apiWorkzonesAppSettingGet,
    method: 'GET',
    userHasAllRights: [],
    userHasAnyOfRights: Object.values(EWorkZonesManagementRights), // All user right need to have access to the app's settings
    validateQuery: {},
    validateBody: null,
    execute: async ({userAuth: {companyId}}) => {
      const settings = await dbWorkzonesAppSettingsLoad(dmdb, companyId);
      return {settings};
    },
  });
};
