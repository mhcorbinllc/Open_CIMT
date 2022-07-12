import {
  IWorkzone,
  EWZShoulder,
  EWZLane,
  EWZBroadcastSelectionMode,
  EWZClosureType,
  EWZClosureSelectionMode,
} from "../../../client";

export const testWorkzones: IWorkzone[] = [
  {
    workzoneId: '02845702-2485792-3413',
    name: 'Ligon St with Wilder',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-01-15T15:45Z'),
    end: new Date('2021-01-15T21:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: true,
    closedShoulder: EWZShoulder.LEFT,
    active: true,
    point: {
      lat: -1,
      lng: -1,
    },
    path: {points: []},
    heading: [],
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2021-01-05T15:45Z').valueOf(),
    updatedAt: new Date('2021-01-05T15:45Z').valueOf(),
    deletedAt: 0,
  },
  {
    workzoneId: '02845702-2485792-3414',
    name: 'Burrell PI - Atwater ST',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-02-01T16:00Z'),
    end: new Date('2021-03-15T21:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: false,
    closedShoulder: EWZShoulder.LEFT,
    active: true,
    path: {points: []},
    point: {
      lat: -1,
      lng: -1,
    },
    heading: [],
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2021-01-03T15:45Z').valueOf(),
    updatedAt: new Date('2021-01-05T15:45Z').valueOf(),
    deletedAt: 0,
  },
  {
    workzoneId: '02845702-2485792-3415',
    name: 'Woods 204 - 621 Hutton',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-04-01T20:00Z'),
    end: new Date('2021-04-15T22:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: true,
    closedShoulder: EWZShoulder.RIGHT,
    active: true,
    path: {points: []},
    point: {
      lat: -1,
      lng: -1,
    },
    heading: [],
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2020-12-15T15:45Z').valueOf(),
    updatedAt: new Date('2020-12-15T15:45Z').valueOf(),
    deletedAt: 0,
  },
  {
    workzoneId: '02845702-2485792-3416',
    name: 'Okelly St 102 - 300 Hutton',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-02-01T22:00Z'),
    end: new Date('2021-02-15T23:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: true,
    closedShoulder: EWZShoulder.RIGHT,
    active: true,
    path: {points: []},
    point: {
      lat: -1,
      lng: -1,
    },
    heading: [],
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2020-12-16T15:45Z').valueOf(),
    updatedAt: new Date('2020-12-16T15:45Z').valueOf(),
    deletedAt: 0,
  },
  {
    workzoneId: '02845702-2485792-3417',
    name: 'Burrell PI with Okelly St 50 - 300 Hutton',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-06-01T21:00Z'),
    end: new Date('2021-06-15T23:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: true,
    closedShoulder: EWZShoulder.LEFT,
    active: true,
    path: {points: []},
    point: {
      lat: -1,
      lng: -1,
    },
    heading: [],
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2020-12-17T15:45Z').valueOf(),
    updatedAt: new Date('2020-12-17T15:45Z').valueOf(),
    deletedAt: 0,
  },
  {
    workzoneId: '02845702-2485792-3418',
    name: 'Royal 200-220 Hutton',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-02-01T16:00Z'),
    end: new Date('2021-02-15T23:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: false,
    closedShoulder: EWZShoulder.LEFT,
    active: true,
    path: {points: []},
    point: {
      lat: -1,
      lng: -1,
    },
    heading: [],
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2020-12-11T15:45Z').valueOf(),
    updatedAt: new Date('2020-12-11T15:45Z').valueOf(),
    deletedAt: 0,
  },
  {
    workzoneId: '02845702-2485792-3419',
    name: 'Gorman with Royal 20 Hutton',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-03-31T16:00Z'),
    end: new Date('2021-04-12T23:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: false,
    closedShoulder: EWZShoulder.LEFT,
    active: true,
    path: {points: []},
    point: {
      lat: -1,
      lng: -1,
    },
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    heading: [],
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2020-12-06T15:45Z').valueOf(),
    updatedAt: new Date('2020-12-06T15:45Z').valueOf(),
    deletedAt: 0,
  },
  {
    workzoneId: '02845702-2485792-3420',
    name: 'Wilcox PI - Gorman Sussex',
    notes: 'Some additional info about this.\nRoad defect',
    start: new Date('2021-06-12T16:00Z'),
    end: new Date('2021-06-12T22:00Z'),
    forEver: false,
    speedLimitInMiles: 10,
    workersPresent: false,
    closedShoulder: EWZShoulder.LEFT,
    active: true,
    path: {points: []},
    point: {
      lat: -1,
      lng: -1,
    },
    heading: [],
    closureSelectionMode: EWZClosureSelectionMode.CUSTOM,
    closureType: EWZClosureType.NONE,
    itisCodes: [],
    closedLaneWidthInMeters: 0,
    kapschId: 24058204,
    closedLane: EWZLane.LEFT,
    broadcast: {
      selectionMode: EWZBroadcastSelectionMode.REGION,
      selectionByRegion: {
        region: {
          points: [{
            lng: 1,
            lat: -0.232,
          }],
        },
      },
      selectionByRadius: {radiusInMeters: 0},
    },
    createdAt: new Date('2020-12-26T15:45Z').valueOf(),
    updatedAt: new Date('2020-12-26T15:45Z').valueOf(),
    deletedAt: 0,
  },
];