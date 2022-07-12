import * as express from "express";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_ApiWorkzonesForOfflineUseGet,
  IApiWorkzonesForOfflineUseGetQueryRequest,
  IApiWorkzonesForOfflineUseGetResponse,
} from "./apiWorkzonesForOfflineUseGet.interfaces";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";

import {dmdb} from "../../../db/getDBs";
import {dbWorkzonesLoadForOfflineUse} from "../db/dbWorkzonesLoadForOfflineUse";

import {convertIDBWorkzoneToIWorkzone} from "../interfaces/IDBWorkzone";

import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

export const apiWorkzonesForOfflineUseGet = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<null, IApiWorkzonesForOfflineUseGetResponse, IApiWorkzonesForOfflineUseGetQueryRequest>({
    expressApp,
    path: API_PATH_ApiWorkzonesForOfflineUseGet,
    method: 'GET',
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
    userHasAnyOfRights: [],
    validateBody: null,
    validateQuery: {
      lastMonths: lastMonths => validateDataMethods.isTextNumberInRangeValidationMessage(lastMonths, 1, 12),
      skip: skip => validateDataMethods.isTextNumberInRangeValidationMessage(skip, 0, 9999999999),
      limit: limit => validateDataMethods.isTextNumberInRangeValidationMessage(limit, 0, 9999999999),
    },
    execute: async (
      {
        query: {
          lastMonths,
          skip,
          limit,
        },
        userAuth: {companyId},
      },
    ) => {
      const workzones = await dbWorkzonesLoadForOfflineUse({
        dmdb,
        companyId,
        lastMonths: Number(lastMonths),
        skip: Number(skip),
        limit: Number(limit),
      });
      return {workzones: workzones.map(convertIDBWorkzoneToIWorkzone)};
    },
  });
};
