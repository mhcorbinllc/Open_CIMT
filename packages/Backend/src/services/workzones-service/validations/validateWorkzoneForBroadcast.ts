import {
  IWorkzone,
  EWZBroadcastSelectionMode,
  IGeoPoint,
  IGeoLine,
  IGeoPolygon,
  EWZClosureType,
  EWZLane,
  EWZShoulder,
  EWZHeading,
  EWZClosureTypeDeprecated,
} from "../interfaces/IWorkzone";

import {EWZClosureSelectionMode} from "../interfaces/IWorkzonesAppSettings";

import {validateWorkzoneForUpdate} from "./validateWorkzoneForUpdate";

import {IValidateDataEngineRules} from "core-library/dist/commonJs/validation-engine";
import {validateWorkzoneElements} from "../interfaces/validateWorkzoneElements";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

// This is the complete validation of a CIM to be possible to broadcast it.
// Here we implement the validation that Kapsch needs for a CIM.
// Developer, remember to OVERLOAD (and not override) the validateWorkzoneForUpdate's validations.

// Dev notes: Type of closure data: https://docs.google.com/spreadsheets/d/1_y0YbEvzRtHp4KFFruyA3_xVY-RTKwM_5EfnrR0r1M0/edit?usp=sharing

export const validateWorkzoneForBroadcast: IValidateDataEngineRules<IWorkzone> = {
  ...validateWorkzoneForUpdate,

  active: (active: boolean, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.active(active, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (!active) return 'Cannot broadcast inactive CIM!';
    return true;
  },

  end: (end_: Date, workzone) => {
    end_; // 4TS
    if (workzone.forEver) return true;

    // End validation
    const start = new Date(workzone.start);
    const end = new Date(workzone.end);
    if (end.valueOf() <= start.valueOf()) return 'The "End" date/time cannot be before or the same as the Start date';
    if (end.valueOf() <= Date.now()) return 'The "End" date/time is before the current time, nothing will be broadcast';

    // Minutes duration validation
    const startDate = new Date(workzone.start);
    const endDate = new Date(workzone.end);
    // Dev note: If the number of the days changed, consider updating also the point: #202108190832
    const maxDuration = 32000;
    const duration: number = Math.round((endDate.getTime() - startDate.getTime()) / 1000) / 60;
    if (duration > maxDuration) return 'Minutes duration from start to end date exceeds the maximum number of minutes allowed (22 days, 5 hours, and 20 minutes or 32000 minutes)';

    return true;
  },

  speedLimitInMiles: (speedLimitInMiles: number, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.speedLimitInMiles(speedLimitInMiles, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (workzone.closureSelectionMode === EWZClosureSelectionMode.CUSTOM) return true;
    const hasSpeedLimit = speedLimitInMiles > 0;
    if (hasSpeedLimit && speedLimitInMiles < 15) return 'Speed limit must be 15mph or greater';
    if (speedLimitInMiles > 70) return 'Speed limit cannot be more than 70mph';
    if (hasSpeedLimit && speedLimitInMiles % 5 !== 0) return 'Speed limit must be in increments of 5mph.';
    return true;
  },

  closureType: (closureType: EWZClosureType, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.closureType(closureType, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    const isSimple = workzone.closureSelectionMode === EWZClosureSelectionMode.SIMPLE;
    if (
      isSimple
      && closureType === EWZClosureType.NONE
    ) {
      return 'Closure type is not selected';
    }
    if (
      isSimple
      && validateDataMethods.isEnumValue(closureType, EWZClosureTypeDeprecated)
    ) {
      return 'Closure type is deprecated, please select a different closure type';
    }
    return true;
  },

  itisCodes: (itisCodes: number[], workzone) => {
    const parentValidation = validateWorkzoneForUpdate.itisCodes(itisCodes, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;

    if (
      workzone.closureSelectionMode === EWZClosureSelectionMode.SIMPLE
      && workzone.closureType === EWZClosureType.NONE
    ) return true; // The closureType validation is shown, don't complain about the ITIS codes.

    if (
      workzone.closureSelectionMode === EWZClosureSelectionMode.SIMPLE
      && !!workzone.closureType
      && workzone.closureType !== EWZClosureType.NONE
      && itisCodes.length === 0
    ) return 'The selected closure type has not returned any ITIS codes';

    if (itisCodes.length === 0) return 'No ITIS code is selected';

    return true;
  },

  closedLane: (closedLane: EWZLane, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.closedLane(closedLane, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (workzone.closureSelectionMode === EWZClosureSelectionMode.CUSTOM) return true; // Controlled by simple closures only
    if (
      workzone.closureSelectionMode === EWZClosureSelectionMode.SIMPLE
      && workzone.closureType !== EWZClosureType.NONE
      && [
        EWZClosureType.LEFT_LANE_CLOSED_MERGE_RIGHT,
        EWZClosureType.RIGHT_LANE_CLOSED_MERGE_LEFT,
      ].includes(workzone.closureType as EWZClosureType)
      && closedLane === EWZLane.NONE
    ) {
      return 'Closed lane is not selected';
    }
    return true;
  },

  closedLaneWidthInMeters: (value: number, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.closedLaneWidthInMeters(value, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (workzone.closureSelectionMode === EWZClosureSelectionMode.CUSTOM) return true;
    if (value < 0.3048) return "Should be bigger than 1 feet";
    if (value > 49.9872) return "Should be less than 164 feet";
    return true;
  },

  closedShoulder: (closedShoulder: EWZShoulder, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.closedShoulder(closedShoulder, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (workzone.closureSelectionMode === EWZClosureSelectionMode.CUSTOM) return true;// Only simple type sets the closedShoulder
    if (
      workzone.closureSelectionMode === EWZClosureSelectionMode.SIMPLE
      && workzone.closureType !== EWZClosureType.NONE
      && [
        EWZClosureType.LEFT_SHOULDER_CLOSED,
        EWZClosureType.RIGHT_SHOULDER_CLOSED,
      ].includes(workzone.closureType as EWZClosureType)
      && closedShoulder === EWZShoulder.NONE
    ) return 'Closed shoulder is not selected';
    return true;
  },

  point: (point: IGeoPoint, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.point(point, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (point.lat === 0 || point.lng === 0) return 'Reference point is not defined';
    return '';
  },

  path: (path: IGeoLine, workzone) => {
    const parentValidation = validateWorkzoneForUpdate.path(path, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (path.points.length <= 1) return 'Path is not defined';
    if (path.points.length > 63) return 'The maximum number of points allowed for the path is 63';
    return '';
  },

  heading: (headings: EWZHeading[], workzone) => {
    const parentValidation = validateWorkzoneForUpdate.heading(headings, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (headings.length > 16) return 'Too many headings provided';
    const duplicates = validateDataMethods.hasUniqueValues(headings);
    if (duplicates !== true) return 'There are duplicate headings provided';
    return '';
  },

  "broadcast.selectionByRegion.region": (region: IGeoPolygon, workzone) => {
    const parentValidation = validateWorkzoneForUpdate["broadcast.selectionByRegion.region"](region, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (workzone.broadcast.selectionMode === EWZBroadcastSelectionMode.RADIUS) return true;
    return validateWorkzoneElements.isValidGeoAreaPolygon(region);
  },

  "broadcast.selectionByRadius.radiusInMeters": (radius: number, workzone) => {
    const parentValidation = validateWorkzoneForUpdate["broadcast.selectionByRadius.radiusInMeters"](radius, workzone);
    if (!validateDataMethods.isValid(parentValidation)) return parentValidation;
    if (workzone.broadcast.selectionMode === EWZBroadcastSelectionMode.REGION) return true;
    if (radius === 0) return 'Radius broadcast area cannot be zero';
    return true;
  },
};
