import {
  IWorkzone,
  EWZLane,
  EWZShoulder,
  EWZBroadcastSelectionMode,
  IGeoPolygon,
  EWZClosureType,
  EWZClosureTypeDeprecated,
} from "../interfaces/IWorkzone";

import {EWZClosureSelectionMode} from "../interfaces/IWorkzonesAppSettings";

import {IValidateDataEngineRules} from "core-library/dist/commonJs/validation-engine";

import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";
import {validateWorkzoneElements} from "../interfaces/validateWorkzoneElements";

// This is very basic validation, we check only security and if the props exist and have correct type.
// We don't validate the logic or if the values are right since we allow the user , this is done on broadcast.

export const validateWorkzoneForUpdate: IValidateDataEngineRules<IWorkzone> = {
  workzoneId: validateDataMethods.hasValueValidationMessage,
  kapschId: validateDataMethods.isNumberValidationMessage,

  active: validateDataMethods.isBooleanValidationMessage,

  name: (name: string) => validateDataMethods.isValidTextValidationMessage(name, 2, 300),
  start: validateDataMethods.isValidDateValueValidationMessage,
  end: validateDataMethods.isValidDateValueValidationMessage,
  forEver: validateDataMethods.isBooleanValidationMessage,
  speedLimitInMiles: validateDataMethods.isIntegerValidationMessage,

  closureSelectionMode: (value: string) => validateDataMethods.isEnumValueValidationMessage(value, EWZClosureSelectionMode),
  closureType: (value: string, workzone) => {
    if (workzone.closureSelectionMode === EWZClosureSelectionMode.CUSTOM) return true;
    return validateDataMethods.isEnumValueValidationMessage(value, EWZClosureType, EWZClosureTypeDeprecated);
  },
  itisCodes: validateDataMethods.isArrayOfNumbersValidationMessage,
  closedLane: (value: string) => validateDataMethods.isEnumValueValidationMessage(value, EWZLane),
  closedShoulder: (value: string) => validateDataMethods.isEnumValueValidationMessage(value, EWZShoulder),

  closedLaneWidthInMeters: validateDataMethods.isNumberValidationMessage,
  workersPresent: validateDataMethods.isBooleanValidationMessage,

  notes: (value: string) => validateDataMethods.isValidTextValidationMessage(value, 0, 10000),

  point: validateWorkzoneElements.isValidGeoPoint,

  path: validateWorkzoneElements.isValidGeoLine,

  heading: validateWorkzoneElements.isValidHeadings,

  broadcast: validateDataMethods.hasValueValidationMessage,
  "broadcast.selectionMode": (value: string) => validateDataMethods.isEnumValueValidationMessage(value, EWZBroadcastSelectionMode),
  "broadcast.selectionByRegion": validateDataMethods.hasValueValidationMessage,
  "broadcast.selectionByRegion.region": (region: IGeoPolygon, workzone) => {
    if (workzone.broadcast.selectionMode === EWZBroadcastSelectionMode.RADIUS) return true;
    return validateWorkzoneElements.isValidPoints(region.points);
  },
  "broadcast.selectionByRadius": validateDataMethods.hasValueValidationMessage,
  "broadcast.selectionByRadius.radiusInMeters": (value: number, workzone) => {
    if (workzone.broadcast.selectionMode === EWZBroadcastSelectionMode.REGION) return true;
    return validateDataMethods.isNumberInRangeValidationMessage(value, 0, 999999);
  },

  createdAt: () => true,  // Ignore them since are overwritten by the db methods anyway
  updatedAt: () => true,
  deletedAt: () => true,
};
