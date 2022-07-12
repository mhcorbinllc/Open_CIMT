import * as express from "express";

import {
  API_PATH_apiWorkzoneItemHistorySearch,
  IApiWorkzoneItemHistorySearchGetQueryRequest,
  IApiWorkzoneItemHistorySearchGetResponse,
} from "./apiWorkzoneItemHistorySearch.interfaces";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {dmdb} from "../../../db/getDBs";
import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {dbWorkzoneItemHistorySearch} from "../db/dbWorkzoneItemHistorySearch";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

export const apiWorkzoneItemHistorySearchGet = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<null, IApiWorkzoneItemHistorySearchGetResponse, IApiWorkzoneItemHistorySearchGetQueryRequest>({
    expressApp,
    path: API_PATH_apiWorkzoneItemHistorySearch,
    method: 'GET',
    userHasAllRights: [],
    userHasAnyOfRights: Object.values(EWorkZonesManagementRights),
    validateBody: null,
    validateQuery: {
      workzoneId: workzoneId => validateDataMethods.isValidTextValidationMessage(workzoneId, 1, 30),
      search: validateDataMethods.isStringValidationMessage,
      skip: skip => validateDataMethods.isTextNumberInRangeValidationMessage(skip, 0, 9999999999),
      limit: limit => validateDataMethods.isTextNumberInRangeValidationMessage(limit, 0, 9999999999),
    },
    execute: async (
      {
        query: {
          workzoneId,
          search: searchText,
          skip: _skip,
          limit: _limit,
        },
        userAuth: {companyId},
      },
    ) => {
      const workzones = await dbWorkzoneItemHistorySearch({
        dmdb,
        companyId,
        workzoneId,
        searchText,
        skip: Number(_skip),
        limit: Number(_limit),
      });

      return {workzones};
    },
  });
};

