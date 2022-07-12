import * as moment from "moment";

import {
  IWorkzone,
  EWZBroadcastSelectionMode,
  EWZLane,
  EWZShoulder,
  EWZHeading,
  EWZClosureType,
  EWZClosureTypeDeprecated,
} from "../interfaces/IWorkzone";

import {getDefaultWorkzone} from "../interfaces/getDefaultWorkzone";
import {validationEngine} from "core-library/dist/commonJs/validation-engine";

import {validateWorkzoneForBroadcast} from "./validateWorkzoneForBroadcast";
import {EWZClosureSelectionMode} from "../interfaces/IWorkzonesAppSettings";

const now = Date.now();

const validBasicWorkzone: IWorkzone = {
  ...getDefaultWorkzone(),
  active: true,
  start: new Date(now + 200),
  end: new Date(now + 400),
  name: 'Demo CIM',
  workzoneId: 'ed-98467204',
  speedLimitInMiles: 0,
  itisCodes: [200, 300],
  closureType: EWZClosureType.LEFT_LANE_CLOSED_MERGE_RIGHT,
  closedLane: EWZLane.CENTER,
  closedShoulder: EWZShoulder.LEFT,
  closedLaneWidthInMeters: 12,
  point: {
    lng: 0.224423,
    lat: 0.134211,
  },
  heading: [EWZHeading.NORTH],
  path: {
    points: [
      {
        lng: 0.224423,
        lat: 0.134211,
      },
      {
        lng: 0.224423,
        lat: 0.134212,
      },
    ],
  },
  broadcast: {
    selectionMode: EWZBroadcastSelectionMode.RADIUS,
    selectionByRadius: {radiusInMeters: 12},
    selectionByRegion: {region: {points: []}},
  },
};

describe('validateWorkzoneForBroadcast', () => {
  test('Correct CIM', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('Empty CIM', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(getDefaultWorkzone()));

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(Object.keys(validation).length).not.toBe(0);
    expect(validation).toMatchSnapshot();
  });

  test('CIM with unselected closure type', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...validBasicWorkzone,
      closureSelectionMode: EWZClosureSelectionMode.SIMPLE,
      closureType: EWZClosureType.NONE,
    } as IWorkzone));

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with selected closure type but no ITIS codes', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...validBasicWorkzone,
      closureSelectionMode: EWZClosureSelectionMode.SIMPLE,
      closureType: EWZClosureType.LEFT_LANE_CLOSED_MERGE_RIGHT,
      itisCodes: [],
    } as IWorkzone));

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with custom closure selection mode and no ITIS codes', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...validBasicWorkzone,
      closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
      closureType: EWZClosureType.LEFT_LANE_CLOSED_MERGE_RIGHT,
      itisCodes: [],
    } as IWorkzone));

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with custom closure selection mode, no closureType and no ITIS codes', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...validBasicWorkzone,
      closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
      closureType: EWZClosureType.NONE,
      itisCodes: [],
    } as IWorkzone));

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with radius broadcast selection, without radius', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.RADIUS;
    workzone.broadcast.selectionByRadius.radiusInMeters = 0;

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with region broadcast selection, without points', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.REGION;
    workzone.broadcast.selectionByRegion.region.points = [];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with region broadcast selection, with 1 point', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.REGION;
    workzone.broadcast.selectionByRegion.region.points = [
      {
        lat: 0.23,
        lng: 0.45,
      },
    ];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with region broadcast selection, with 2 points', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.REGION;
    workzone.broadcast.selectionByRegion.region.points = [
      {
        lat: 0.23,
        lng: 0.45,
      },
      {
        lat: 0.23,
        lng: 0.46,
      },
    ];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with region broadcast selection, with 3 points (does not close)', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.REGION;
    workzone.broadcast.selectionByRegion.region.points = [
      {
        lat: 0.23,
        lng: 0.45,
      },
      {
        lat: 0.23,
        lng: 0.46,
      },
      {
        lat: 0.24,
        lng: 0.46,
      },
    ];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with region broadcast selection, with 3 points (close)', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.REGION;
    workzone.broadcast.selectionByRegion.region.points = [
      {
        lat: 0.23,
        lng: 0.45,
      },
      {
        lat: 0.23,
        lng: 0.46,
      },
      {
        lat: 0.23,
        lng: 0.45,
      },
    ];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with region broadcast selection, with 4 points (does not close)', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.REGION;
    workzone.broadcast.selectionByRegion.region.points = [
      {
        lat: 0.23,
        lng: 0.45,
      },
      {
        lat: 0.23,
        lng: 0.46,
      },
      {
        lat: 0.24,
        lng: 0.46,
      },
      {
        lat: 0.23,
        lng: 0.47,
      },
    ];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with region broadcast selection, with 4 points (close)', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.broadcast.selectionMode = EWZBroadcastSelectionMode.REGION;
    workzone.broadcast.selectionByRegion.region.points = [
      {
        lat: 0.23,
        lng: 0.45,
      },
      {
        lat: 0.23,
        lng: 0.46,
      },
      {
        lat: 0.24,
        lng: 0.46,
      },
      {
        lat: 0.23,
        lng: 0.45,
      },
    ];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM duration in minutes cannot be greater than 32000', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.start = new Date();
    workzone.end = moment(workzone.start).add(32001, 'minutes')
      .toDate();

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with duplicate headings', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.heading = [EWZHeading.NORTH, EWZHeading.NORTH];

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM speedLimitInMiles not divisible by 5mph', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.speedLimitInMiles = 19;

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM forever with wrong end date, should not complain', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.end = new Date(workzone.start.valueOf() - 100);
    workzone.forEver = true;

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with deprecated simple closure type fails validation', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.closureSelectionMode = EWZClosureSelectionMode.SIMPLE;
    workzone.closureType = EWZClosureTypeDeprecated.LEFT_2_LANES_CLOSED_AHEAD;

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM with deprecated simple closure type does not fail when custom mode is selected', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.closureSelectionMode = EWZClosureSelectionMode.CUSTOM;
    workzone.closureType = EWZClosureTypeDeprecated.LEFT_2_LANES_CLOSED_AHEAD;

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM closedLane and closedShoudler validations do not fail on custom selection type', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.closureSelectionMode = EWZClosureSelectionMode.CUSTOM;
    workzone.closedShoulder = EWZShoulder.NONE;
    workzone.closedLane = EWZLane.NONE;

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });

  test('CIM closedLane and closedShoudler validations do not fail on custom selection type with simple closure set to a reduced speed closure', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone));
    workzone.closureSelectionMode = EWZClosureSelectionMode.CUSTOM;
    workzone.closureType = EWZClosureType.REDUCED_SPEED_20_MPH;
    workzone.closedShoulder = EWZShoulder.NONE;
    workzone.closedLane = EWZLane.NONE;

    const validation = validationEngine(workzone, validateWorkzoneForBroadcast);

    expect(validation).toMatchSnapshot();
  });
});
