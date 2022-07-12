import * as express from "express";
import {dynaError} from "dyna-error";

import {IValidationResult} from "core-library/dist/commonJs/validation-engine";
import {EWorkZonesManagementRights} from "../interfaces/EWorkZonesManagementRights";

import {
  API_PATH_apiWorkzonesAppSettingPost,
  IApiWorkzonesAppSettingPostBodyRequest,
  IApiWorkzonesAppSettingPostResponse,
} from "./apiWorkzonesAppSettingPost.interfaces";

import {
  IWorkzonesAppSettings,
  IValidationErrorItisRemoveBlockedByWorkzone,
} from "../interfaces/IWorkzonesAppSettings";

import {secureEndpoint} from "../../user-authentication/secureEndpoint";

import {dmdb} from "../../../db/getDBs";
import {dbWorkzonesAppSettingsSave} from "../db/dbWorkzonesAppSettingsSave";
import {dbWorkzonesAppSettingsLoad} from "../db/dbWorkzonesAppSettingsLoad";
import {dbWorkzoneItemsWithItisCodes} from "../db/dbWorkzoneItemsWithItisCodes";

import {validateWorkzonesAppSettings} from "../validations/validateWorkzonesAppSettings";

export const apiWorkzonesAppSettingPost = (
  {expressApp}: {
    expressApp: express.Application;
  },
): void => {
  secureEndpoint<IApiWorkzonesAppSettingPostBodyRequest, IApiWorkzonesAppSettingPostResponse>({
    expressApp,
    path: API_PATH_apiWorkzonesAppSettingPost,
    method: 'POST',
    userHasAllRights: [EWorkZonesManagementRights.WORKZONES_EDIT],
    userHasAnyOfRights: [],
    advancedProtection: true,
    validateQuery: null,
    validateBody: validateWorkzonesAppSettings,
    execute: async (
      {
        body,
        userAuth: {companyId},
      },
    ) => {
      const {itisCodes} = await dbWorkzonesAppSettingsLoad(dmdb, companyId);

      const requestCodes: number[] = body.itisCodes.map(({code}) => (code));
      const missingCodes: number[] = itisCodes
        .map(({code}) => (code))
        .filter(itisCode => requestCodes.indexOf(itisCode) === -1);

      const workzones = await dbWorkzoneItemsWithItisCodes({
        dmdb,
        companyId,
        itisCodes: missingCodes,
      });

      if (workzones.length > 0) {
        const workzonesRemovedItisCodes: IValidationErrorItisRemoveBlockedByWorkzone[] = workzones
          .map((workzone) => {
            return {
              workzone,
              removedItisCodes: workzone.itisCodes.filter(itisCode => requestCodes.indexOf(itisCode) === -1),
            };
          });

        const userMessage = "Unable to modify or delete ITIS since it is used already.";

        throw dynaError({
          code: 202109101500,
          status: 400,
          message: 'Unable to modify or delete ITIS codes currently used in saved CIMs.',
          userMessage: userMessage,
          validationErrors: {
            body: {
              isValid: false,
              messages: [userMessage],
              dataValidation: {},
              customValidation: {workzonesRemovedItisCodes},
            } as IValidationResult<IWorkzonesAppSettings>,
          },
        });
      }

      await dbWorkzonesAppSettingsSave({
        dmdb,
        companyId,
        workzoneAppSettings: {
          ...body,
          deviceId: '*',
        },
      });
      return {ok: true};
    },
  });
};
