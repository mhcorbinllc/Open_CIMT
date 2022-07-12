import {EWZClosureSelectionMode} from "./IWorkzonesAppSettings";

// Dev note: In case you want to change this interface, consider to update existed data.
// Otherwise the app would break on render!
// - Database, through migration scripts
// - Database, CIM history items
// - Client's indexedDB CIMs items

export interface IWorkzone {
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
    | EWZSimpleClosureTypeHeightLimit
    | EWZClosureTypeDeprecated
    ;
  itisCodes: number[];
  closedLane: EWZLane;
  closedShoulder: EWZShoulder;
  speedLimitInMiles: number;

  closedLaneWidthInMeters: number;
  workersPresent: boolean;
  notes: string;

  point: IGeoPoint;

  path: IGeoLine;

  heading: EWZHeading[];

  broadcast: ICIMBroadcast;

  createdAt: number;
  updatedAt: number;
  deletedAt: number;
}

export interface ICIMBroadcast {
  selectionMode: EWZBroadcastSelectionMode;
  selectionByRegion: ICIMBroadcastSelectionByRegion;
  selectionByRadius: ICIMBroadcastSelectionByRadius;
}
export interface ICIMBroadcastSelectionByRegion {
  region: IGeoPolygon;
}
export interface ICIMBroadcastSelectionByRadius {
  // Referenced to `point`
  radiusInMeters: number;
}

export enum EWZBroadcastSelectionMode {
  REGION = "REGION",
  RADIUS = "RADIUS",
}

export interface IGeoPoint {
  lat: number;
  lng: number;
  alt?: number;
}

export interface IGeoPolygon {
  points: IGeoPoint[];
}

export interface IGeoLine {
  points: IGeoPoint[];
}

export enum EWZShoulder {
  NONE = "NONE",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum EWZLane {
  NONE = "NONE",
  RIGHT = "RIGHT",
  LEFT = "LEFT",
  CENTER = "CENTER",
  ALL = "ALL",
}

export enum EWZSimpleClosureType {
  NONE = "NONE",
  LANE_CLOSED = "LANE_CLOSED",
  SHOULDER_CLOSED = "SHOULDER_CLOSED",
  REDUCED_SPEED = "REDUCED_SPEED",
  LEFT_TURN = "LEFT_TURN",
  RIGHT_TURN = "RIGHT_TURN",
  HEIGHT_LIMIT = "HEIGHT_LIMIT",
}

export enum EWZSimpleClosureTypeLane {
  LEFT_LANE_CLOSED_MERGE_RIGHT = "LEFT_LANE_CLOSED_MERGE_RIGHT",
  RIGHT_LANE_CLOSED_MERGE_LEFT = "RIGHT_LANE_CLOSED_MERGE_LEFT",
}

export enum EWZSimpleClosureTypeShoulder {
  LEFT_SHOULDER_CLOSED = "LEFT_SHOULDER_CLOSED",
  RIGHT_SHOULDER_CLOSED = "RIGHT_SHOULDER_CLOSED",
}

export enum EWZSimpleClosureTypeReducedSpeed {
  REDUCED_SPEED_15_MPH = "REDUCED_SPEED_15_MPH",
  REDUCED_SPEED_20_MPH = "REDUCED_SPEED_20_MPH",
  REDUCED_SPEED_25_MPH = "REDUCED_SPEED_25_MPH",
  REDUCED_SPEED_30_MPH = "REDUCED_SPEED_30_MPH",
  REDUCED_SPEED_35_MPH = "REDUCED_SPEED_35_MPH",
  REDUCED_SPEED_40_MPH = "REDUCED_SPEED_40_MPH",
  REDUCED_SPEED_45_MPH = "REDUCED_SPEED_45_MPH",
  REDUCED_SPEED_50_MPH = "REDUCED_SPEED_50_MPH",
  REDUCED_SPEED_55_MPH = "REDUCED_SPEED_55_MPH",
  REDUCED_SPEED_60_MPH = "REDUCED_SPEED_60_MPH",
  REDUCED_SPEED_65_MPH = "REDUCED_SPEED_65_MPH",
  REDUCED_SPEED_70_MPH = "REDUCED_SPEED_70_MPH",
}

export enum EWZSimpleClosureTypeLeftTurn {
  LEFT_TURN_SPEED_15_MPH = "LEFT_TURN_SPEED_15_MPH",
  LEFT_TURN_SPEED_20_MPH = "LEFT_TURN_SPEED_20_MPH",
  LEFT_TURN_SPEED_25_MPH = "LEFT_TURN_SPEED_25_MPH",
  LEFT_TURN_SPEED_30_MPH = "LEFT_TURN_SPEED_30_MPH",
  LEFT_TURN_SPEED_35_MPH = "LEFT_TURN_SPEED_35_MPH",
  LEFT_TURN_SPEED_40_MPH = "LEFT_TURN_SPEED_40_MPH",
  LEFT_TURN_SPEED_45_MPH = "LEFT_TURN_SPEED_45_MPH",
  LEFT_TURN_SPEED_50_MPH = "LEFT_TURN_SPEED_50_MPH",
  LEFT_TURN_SPEED_55_MPH = "LEFT_TURN_SPEED_55_MPH",
}

export enum EWZSimpleClosureTypeRightTurn {
  RIGHT_TURN_SPEED_15_MPH = "RIGHT_TURN_SPEED_15_MPH",
  RIGHT_TURN_SPEED_20_MPH = "RIGHT_TURN_SPEED_20_MPH",
  RIGHT_TURN_SPEED_25_MPH = "RIGHT_TURN_SPEED_25_MPH",
  RIGHT_TURN_SPEED_30_MPH = "RIGHT_TURN_SPEED_30_MPH",
  RIGHT_TURN_SPEED_35_MPH = "RIGHT_TURN_SPEED_35_MPH",
  RIGHT_TURN_SPEED_40_MPH = "RIGHT_TURN_SPEED_40_MPH",
  RIGHT_TURN_SPEED_45_MPH = "RIGHT_TURN_SPEED_45_MPH",
  RIGHT_TURN_SPEED_50_MPH = "RIGHT_TURN_SPEED_50_MPH",
  RIGHT_TURN_SPEED_55_MPH = "RIGHT_TURN_SPEED_55_MPH",
}

export enum EWZSimpleClosureTypeHeightLimit {
  HEIGHT_LIMIT_14_FT_0_IN = "HEIGHT_LIMIT_14_FT_0_IN",
}

// Using as composite enum for all closure types
export enum EWZClosureType {
  NONE = "NONE",
  LEFT_LANE_CLOSED_MERGE_RIGHT = "LEFT_LANE_CLOSED_MERGE_RIGHT",
  RIGHT_LANE_CLOSED_MERGE_LEFT = "RIGHT_LANE_CLOSED_MERGE_LEFT",
  LEFT_SHOULDER_CLOSED = "LEFT_SHOULDER_CLOSED",
  RIGHT_SHOULDER_CLOSED = "RIGHT_SHOULDER_CLOSED",
  REDUCED_SPEED_15_MPH = "REDUCED_SPEED_15_MPH",
  REDUCED_SPEED_20_MPH = "REDUCED_SPEED_20_MPH",
  REDUCED_SPEED_25_MPH = "REDUCED_SPEED_25_MPH",
  REDUCED_SPEED_30_MPH = "REDUCED_SPEED_30_MPH",
  REDUCED_SPEED_35_MPH = "REDUCED_SPEED_35_MPH",
  REDUCED_SPEED_40_MPH = "REDUCED_SPEED_40_MPH",
  REDUCED_SPEED_45_MPH = "REDUCED_SPEED_45_MPH",
  REDUCED_SPEED_50_MPH = "REDUCED_SPEED_50_MPH",
  REDUCED_SPEED_55_MPH = "REDUCED_SPEED_55_MPH",
  REDUCED_SPEED_60_MPH = "REDUCED_SPEED_60_MPH",
  REDUCED_SPEED_65_MPH = "REDUCED_SPEED_65_MPH",
  REDUCED_SPEED_70_MPH = "REDUCED_SPEED_70_MPH",
  LEFT_TURN_SPEED_15_MPH = "LEFT_TURN_SPEED_15_MPH",
  LEFT_TURN_SPEED_20_MPH = "LEFT_TURN_SPEED_20_MPH",
  LEFT_TURN_SPEED_25_MPH = "LEFT_TURN_SPEED_25_MPH",
  LEFT_TURN_SPEED_30_MPH = "LEFT_TURN_SPEED_30_MPH",
  LEFT_TURN_SPEED_35_MPH = "LEFT_TURN_SPEED_35_MPH",
  LEFT_TURN_SPEED_40_MPH = "LEFT_TURN_SPEED_40_MPH",
  LEFT_TURN_SPEED_45_MPH = "LEFT_TURN_SPEED_45_MPH",
  LEFT_TURN_SPEED_50_MPH = "LEFT_TURN_SPEED_50_MPH",
  LEFT_TURN_SPEED_55_MPH = "LEFT_TURN_SPEED_55_MPH",
  RIGHT_TURN_SPEED_15_MPH = "RIGHT_TURN_SPEED_15_MPH",
  RIGHT_TURN_SPEED_20_MPH = "RIGHT_TURN_SPEED_20_MPH",
  RIGHT_TURN_SPEED_25_MPH = "RIGHT_TURN_SPEED_25_MPH",
  RIGHT_TURN_SPEED_30_MPH = "RIGHT_TURN_SPEED_30_MPH",
  RIGHT_TURN_SPEED_35_MPH = "RIGHT_TURN_SPEED_35_MPH",
  RIGHT_TURN_SPEED_40_MPH = "RIGHT_TURN_SPEED_40_MPH",
  RIGHT_TURN_SPEED_45_MPH = "RIGHT_TURN_SPEED_45_MPH",
  RIGHT_TURN_SPEED_50_MPH = "RIGHT_TURN_SPEED_50_MPH",
  RIGHT_TURN_SPEED_55_MPH = "RIGHT_TURN_SPEED_55_MPH",
  HEIGHT_LIMIT_14_FT_0_IN = "HEIGHT_LIMIT_14_FT_0_IN",
}

export enum EWZClosureTypeDeprecated {
  RIGHT_2_LANES_CLOSED_AHEAD = "RIGHT_2_LANES_CLOSED_AHEAD",
  LEFT_2_LANES_CLOSED_AHEAD = "LEFT_2_LANES_CLOSED_AHEAD",
  LEFT_LANE_CLOSED_AHEAD_MERGE_RIGHT = "LEFT_LANE_CLOSED_AHEAD_MERGE_RIGHT",
  RIGHT_LANE_CLOSED_AHEAD_MERGE_LEFT = "RIGHT_LANE_CLOSED_AHEAD_MERGE_LEFT",
  LEFT_SHOULDER_CLOSED_AHEAD = "LEFT_SHOULDER_CLOSED_AHEAD",
  RIGHT_SHOULDER_CLOSED_AHEAD = "RIGHT_SHOULDER_CLOSED_AHEAD",
  REDUCED_SPEED_AHEAD_15_MPH = "REDUCED_SPEED_AHEAD_15_MPH",
  REDUCED_SPEED_AHEAD_20_MPH = "REDUCED_SPEED_AHEAD_20_MPH",
  REDUCED_SPEED_AHEAD_25_MPH = "REDUCED_SPEED_AHEAD_25_MPH",
  REDUCED_SPEED_AHEAD_30_MPH = "REDUCED_SPEED_AHEAD_30_MPH",
  REDUCED_SPEED_AHEAD_35_MPH = "REDUCED_SPEED_AHEAD_35_MPH",
  REDUCED_SPEED_AHEAD_40_MPH = "REDUCED_SPEED_AHEAD_40_MPH",
  REDUCED_SPEED_AHEAD_45_MPH = "REDUCED_SPEED_AHEAD_45_MPH",
  REDUCED_SPEED_AHEAD_50_MPH = "REDUCED_SPEED_AHEAD_50_MPH",
  REDUCED_SPEED_AHEAD_55_MPH = "REDUCED_SPEED_AHEAD_55_MPH",
  REDUCED_SPEED_AHEAD_60_MPH = "REDUCED_SPEED_AHEAD_60_MPH",
  REDUCED_SPEED_AHEAD_65_MPH = "REDUCED_SPEED_AHEAD_65_MPH",
  REDUCED_SPEED_AHEAD_70_MPH = "REDUCED_SPEED_AHEAD_70_MPH",
}

export enum EWZHeading {
    NORTH = "from000-0to022-5degrees",
    NORTH_NORTH_EAST = "from022-5to045-0degrees",
    NORTH_EAST = "from045-0to067-5degrees",
    EAST_NORTH_EAST = "from067-5to090-0degrees",
    EAST = "from090-0to112-5degrees",
    EAST_SOUTH_EAST = "from112-5to135-0degrees",
    SOUTH_EAST = "from135-0to157-5degrees",
    SOUTH_SOUTH_EAST = "from157-5to180-0degrees",
    SOUTH = "from180-0to202-5degrees",
    SOUTH_SOUTH_WEST = "from202-5to225-0degrees",
    SOUTH_WEST = "from225-0to247-5degrees",
    WEST_SOUTH_WEST = "from247-5to270-0degrees",
    WEST = "from270-0to292-5degrees",
    WEST_NORTH_WEST = "from292-5to315-0degrees",
    NORTH_WEST = "from315-0to337-5degrees",
    NORTH_NORTH_WEST = "from337-5to360-0degrees",
}
