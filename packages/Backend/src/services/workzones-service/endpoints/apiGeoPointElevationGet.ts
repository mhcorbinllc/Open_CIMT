import * as express from "express";
import {dynaError} from "dyna-error";

import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";
import {
  API_PATH_apiGeoPointElevationGet,
  IApiGeoPointElevationGetResponse,
  IApiGeoPointElevationGetRequest,
} from "./apiGeoPointElevationGet.interfaces";

import {apiGoogleElevationGet} from "../providers/google-elevation-api";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

export const apiGeoPointElevationGet = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<null, IApiGeoPointElevationGetResponse, IApiGeoPointElevationGetRequest>({
    expressApp,
    path: API_PATH_apiGeoPointElevationGet,
    method: 'GET',
    advancedProtection: true,
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
    userHasAnyOfRights: [],
    validateQuery: {positions: validateDataMethods.isGeoPositions},
    validateBody: null,
    execute: async (
      {query: {positions}},
    ) => {
      const elevations = await apiGoogleElevationGet(positions);

      if (elevations.length === 0) {
        throw dynaError({
          code: 202109081500,
          status: 404,
          message: 'Elevation API returned no data',
          userMessage: 'Error retrieving elevation for geo points',
        });
      }

      if (elevations.length !== positions.length) {
        throw dynaError({
          code: 202109081501,
          status: 404,
          message: 'Elevation API returned different amount of items than requested',
          userMessage: 'Error retrieving elevation for geo points',
        });
      }

      return {positions: elevations};
    },
  });
};
