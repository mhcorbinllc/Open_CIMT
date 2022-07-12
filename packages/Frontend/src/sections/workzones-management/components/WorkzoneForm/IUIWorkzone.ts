import {
  convertLengthMetersToFeet,
  convertLengthFeetToMeters,
} from "mhc-ui-components/dist/utils";

import {
  IValidateDataEngineRules,
  validateDataMethods,
} from "core-library/dist/commonJs/validation-engine";

import {
  IWorkzone,
  getDefaultWorkzone,
  validateWorkzoneForBroadcast as workzoneValidateWorkzoneForBroadcast,
  EWZBroadcastSelectionMode,
  EWZClosureSelectionMode,
  EWZClosureType,
  EWZSimpleClosureTypeLane,
  EWZSimpleClosureTypeShoulder,
  EWZSimpleClosureTypeReducedSpeed,
  EWZSimpleClosureTypeLeftTurn,
  EWZSimpleClosureTypeRightTurn,
  EWZSimpleClosureTypeHeightLimit,
  EWZClosureTypeDeprecated,
  EWZLane,
  EWZShoulder,
  EWZHeading,
  IGeoLine,
  IGeoPoint,
  IGeoPolygon,
} from "mhc-server";

export interface IUIWorkzone {
  workzoneId: string; // PK
  kapschId: number;
  active: boolean;

  name: string;
  start: Date;
  end: Date;
  forEver: boolean;

  closureSelectionMode: EWZClosureSelectionMode;
  closureType:
    | EWZClosureType
    | EWZSimpleClosureTypeLane
    | EWZSimpleClosureTypeShoulder
    | EWZSimpleClosureTypeReducedSpeed
    | EWZSimpleClosureTypeLeftTurn
    | EWZSimpleClosureTypeRightTurn
    | EWZClosureTypeDeprecated
    | EWZSimpleClosureTypeHeightLimit
    ;
  itisCodes: number[];
  closedLane: EWZLane;
  closedShoulder: EWZShoulder;
  speedLimitInMiles: number;

  closedLaneWidthInFeet: number;
  workersPresent: boolean;
  notes: string;

  // Point
  point: IGeoPoint;

  // Path
  path: IGeoLine;

  heading: EWZHeading[];

  broadcast: {
    selectionMode: EWZBroadcastSelectionMode;
    selectionByRegion: {
      region: IGeoPolygon;
    };
    selectionByRadius: {
      // Referenced to `point`
      radiusInMeters: number;
    };
  };

  createdAt: number;
  updatedAt: number;
  deletedAt: number;
}

export const convertIWorkzoneToIUIWorkzone = (workzone: IWorkzone): IUIWorkzone => {
  return {
    workzoneId: workzone.workzoneId,
    kapschId: workzone.kapschId,
    active: workzone.active,
    name: workzone.name,
    start: workzone.start,
    end: workzone.end,
    forEver: workzone.forEver,

    closureSelectionMode: workzone.closureSelectionMode,
    closureType: workzone.closureType,
    itisCodes: workzone.itisCodes,
    closedLane: workzone.closedLane,
    closedShoulder: workzone.closedShoulder,
    speedLimitInMiles: workzone.speedLimitInMiles,

    closedLaneWidthInFeet: convertLengthMetersToFeet(workzone.closedLaneWidthInMeters),
    workersPresent: workzone.workersPresent,
    notes: workzone.notes,

    point: workzone.point,

    path: workzone.path,

    heading: workzone.heading,

    broadcast: workzone.broadcast,

    createdAt: workzone.createdAt,
    updatedAt: workzone.updatedAt,
    deletedAt: workzone.deletedAt,
  };
};

export const convertIUIWorkzoneToIWorkzone = (uiWorkzone: IUIWorkzone): IWorkzone => {
  return {
    workzoneId: uiWorkzone.workzoneId,
    kapschId: uiWorkzone.kapschId,
    active: uiWorkzone.active,
    name: uiWorkzone.name,
    start: uiWorkzone.start,
    end: uiWorkzone.end,
    forEver: uiWorkzone.forEver,

    closureSelectionMode: uiWorkzone.closureSelectionMode,
    closureType: uiWorkzone.closureType,
    itisCodes: uiWorkzone.itisCodes,
    closedLane: uiWorkzone.closedLane,
    closedShoulder: uiWorkzone.closedShoulder,
    speedLimitInMiles: uiWorkzone.speedLimitInMiles,

    closedLaneWidthInMeters: convertLengthFeetToMeters(uiWorkzone.closedLaneWidthInFeet),
    workersPresent: uiWorkzone.workersPresent,
    notes: uiWorkzone.notes,

    point: uiWorkzone.point,

    path: uiWorkzone.path,

    heading: uiWorkzone.heading,

    broadcast: uiWorkzone.broadcast,

    createdAt: uiWorkzone.createdAt,
    updatedAt: uiWorkzone.updatedAt,
    deletedAt: uiWorkzone.deletedAt,
  };
};

export const getDefaultUIWorkzone = (): IUIWorkzone => convertIWorkzoneToIUIWorkzone(getDefaultWorkzone());

export const uiWorkzoneValidationRulesForBroadcast = ((): IValidateDataEngineRules<IUIWorkzone> => {
  const validationRules: IValidateDataEngineRules<IUIWorkzone> = {...workzoneValidateWorkzoneForBroadcast} as any;
  validationRules.closedLaneWidthInFeet = (closedLaneWidthInFeet: any, workzone: any): string | boolean => {
    const isValidNumber = validateDataMethods.isNumberValidationMessage(closedLaneWidthInFeet);
    if (!validateDataMethods.isValid(isValidNumber)) return isValidNumber;
    return workzoneValidateWorkzoneForBroadcast.closedLaneWidthInMeters(convertLengthFeetToMeters(closedLaneWidthInFeet), workzone);
  };
  validationRules.workzoneId = () => true; // Do not validate it since the api will assign it anyway.
  delete validationRules.closedLaneWidthInMeters;
  return validationRules;
})();
