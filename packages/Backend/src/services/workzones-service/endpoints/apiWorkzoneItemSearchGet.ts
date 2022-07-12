import * as express from "express";
import {dynaSwitch} from "dyna-switch";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_apiWorkzoneItemSearch,
  IApiWorkzoneItemSearchGetQueryRequest,
  IApiWorkzoneItemSearchGetResponse,
} from "./apiWorkzoneItemSearch.interfaces";

import {dmdb} from "../../../db/getDBs";
import {dbWorkzoneItemSearch} from "../db/dbWorkzoneItemSearch";

import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

export const apiWorkzoneItemSearchGet = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<null, IApiWorkzoneItemSearchGetResponse, IApiWorkzoneItemSearchGetQueryRequest>({
    expressApp,
    path: API_PATH_apiWorkzoneItemSearch,
    method: 'GET',
    userHasAllRights: [],
    userHasAnyOfRights: Object.values(EWorkZonesManagementRights),
    validateQuery: {
      search: validateDataMethods.isStringValidationMessage,
      forEver: (forEver) => {
        if (forEver === 'both') return true;
        return validateDataMethods.isBooleanTextValidationMessage(forEver);
      },
      deleted: validateDataMethods.isBooleanTextValidationMessage,
      skip: skip => validateDataMethods.isTextNumberInRangeValidationMessage(skip, 0, 9999999999),
      limit: limit => validateDataMethods.isTextNumberInRangeValidationMessage(limit, 0, 9999999999),
      sortByFieldName: validateDataMethods.isStringValidationMessage,
      sortDirection: sortDirection => validateDataMethods.isOneOfTheValuesValidationMessage(sortDirection, ['0', '1', '-1']),
    },
    validateBody: null,
    execute: async (
      {
        query: {
          search: searchText,
          forEver,
          deleted,
          skip,
          limit,
          sortByFieldName,
          sortDirection: _sortDirection,
        },
        userAuth: {companyId},
      },
    ) => {
      const workzones = await dbWorkzoneItemSearch({
        dmdb,
        companyId,
        searchText,
        forEver: dynaSwitch<boolean | 'both', any>( // Map the query value to 'both' or boolean
          forEver,
          'both',
          {
            both: 'both',
            true: true,
            false: false,
          },
        ),
        deleted: deleted === "true",
        skip: Number(skip),
        limit: Number(limit),
        sortByFieldName,
        sortDirection: Number(_sortDirection) as any,
      });

      return {workzones};
    },
  });
};
