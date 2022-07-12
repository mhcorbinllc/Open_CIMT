import {
  EWZBroadcastSelectionMode,
  IWorkzone,
  EWZShoulder,
  EWZLane,
} from "../interfaces/IWorkzone";

import {EWZClosureSelectionMode} from "../interfaces/IWorkzonesAppSettings";

import {getDefaultWorkzone} from "../interfaces/getDefaultWorkzone";
import {validationEngine} from "core-library/dist/commonJs/validation-engine";

import {validateWorkzoneForUpdate} from "./validateWorkzoneForUpdate";
import {EWZClosureTypeDeprecated} from "../interfaces/IWorkzone";

describe('validateWorkzoneForUpdate', () => {
  test('Default CIM', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...getDefaultWorkzone(),
      workzoneId: 'ed-98467204',
      name: 'CIM name',
    }));
    expect(validationEngine(workzone, validateWorkzoneForUpdate)).toMatchSnapshot();
  });

  test('Missing workzoneId', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...getDefaultWorkzone(),
      name: 'CIM name',
    }));
    expect(validationEngine(workzone, validateWorkzoneForUpdate)).toMatchSnapshot();
  });

  test('Missing radius in meters', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...getDefaultWorkzone(),
      workzoneId: 'ed-98467204',
      name: 'CIM name',
    }));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.RADIUS;
    workzone.broadcast.selectionByRadius.radiusInMeters = -1;
    expect(validationEngine(workzone, validateWorkzoneForUpdate)).toMatchSnapshot();
  });

  test('Reduced Speed closure type does not fail closed shoulder/lane', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...getDefaultWorkzone(),
      workzoneId: 'ed-98467204',
      name: 'CIM name',
    }));
    workzone.closureSelectionMode = EWZClosureSelectionMode.CUSTOM;
    workzone.closureType = EWZClosureTypeDeprecated.REDUCED_SPEED_AHEAD_30_MPH;
    workzone.closedShoulder = EWZShoulder.NONE;
    workzone.closedLane = EWZLane.NONE;
    expect(validationEngine(workzone, validateWorkzoneForUpdate)).toMatchSnapshot();
  });
});
