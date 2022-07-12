import * as moment from "moment";

import {
  EWZBroadcastSelectionMode,
  EWZClosureType,
  EWZLane,
  EWZShoulder,
  IWorkzone,
} from "./IWorkzone";
import {
  EWZClosureSelectionMode,
} from "./IWorkzonesAppSettings";

export const getDefaultWorkzone = (): IWorkzone => {
  const now = moment().seconds(0);

  return {
    workzoneId: '',
    kapschId: -1,
    name: '',
    active: true,

    notes: '',
    start: now.toDate(),
    end: now.clone().add(3, 'days')
      .toDate(),
    forEver: false,

    closureSelectionMode: EWZClosureSelectionMode.SIMPLE,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLane: EWZLane.NONE,
    closedShoulder: EWZShoulder.NONE,
    speedLimitInMiles: 0,

    closedLaneWidthInMeters: 0,
    workersPresent: false,

    point: {
      lat: 0,
      lng: 0,
      alt: 0,
    },

    path: {points: []},

    heading: [],

    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {region: {points: []}},
      selectionByRadius: {radiusInMeters: 0},
    },

    createdAt: 0,
    updatedAt: 0,
    deletedAt: 0,
  };
};

