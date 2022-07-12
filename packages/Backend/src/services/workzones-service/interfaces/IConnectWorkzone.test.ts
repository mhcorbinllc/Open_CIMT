import {
  IWorkzone,
  EWZLane,
  EWZShoulder,
  EWZBroadcastSelectionMode,
} from "./IWorkzone";
import {
  IWorkzonesAppSettings,
  EWZTXMode,
  EWZClosureSelectionMode,
} from "./IWorkzonesAppSettings";

import {convertIWorkzoneToIConnectWorkzone} from "./convertIWorkzoneToIConnectWorkzone";
import {getDefaultWorkzone} from "./getDefaultWorkzone";

const workzoneAppSettings: IWorkzonesAppSettings = {
  closureSelectionMode: EWZClosureSelectionMode.SIMPLE,
  deviceId: "*",
  intervalInMs: 1300,
  itisCodes: [
    {
      code: 769,
      label: "Closed to traffic",
    },
    {
      code: 771,
      label: "Closed ahead",
    },
    {
      code: 7451,
      label: "Merge",
    },
    {
      code: 8195,
      label: "Left lane",
    },
    {
      code: 8196,
      label: "Right lane",
    },
    {
      code: 8208,
      label: "Right shoulder",
    },
    {
      code: 8209,
      label: "Left shoulder",
    },
    {
      code: 12545,
      label: "One",
    },
    {
      code: 12546,
      label: "Two",
    },
    {
      code: 12547,
      label: "Three",
    },
    {
      code: 12548,
      label: "Four",
    },
    {
      code: 12549,
      label: "Five",
    },
    {
      code: 13579,
      label: "Right",
    },
    {
      code: 13580,
      label: "Left",
    },
  ],
  priority: 62,
  psid: "8002F",
  serviceChannel: "176",
  txmode: EWZTXMode.CONT,
  useEncryption: true,
  useSignature: false,
  createdAt: 1614763319202,
  updatedAt: 1620226220921,
  deletedAt: 0,
};

const now = new Date(0).valueOf();

const validBasicWorkzone: IWorkzone = {
  ...getDefaultWorkzone(),
  active: true,
  start: new Date(now + 200),
  end: new Date(now + 201),
  name: 'Demo CIM',
  workzoneId: 'ed-98467204',
  itisCodes: [200, 300],
  closedLane: EWZLane.CENTER,
  closedShoulder: EWZShoulder.LEFT,
  closedLaneWidthInMeters: 12,
  point: {
    lng: 0.224423,
    lat: 0.134211,
  },

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

describe('convertIWorkzoneToIKapschWorkzone', () => {
  test('Convert to IKapschWorkzone a Radius CIM', () => {
    expect(
      convertIWorkzoneToIConnectWorkzone({
        workzoneAppSettings,
        workzone: JSON.parse(JSON.stringify(validBasicWorkzone as IWorkzone)),
      }),
    ).toMatchSnapshot();
  });
  test('Convert to IKapschWorkzone a Region CIM', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify(validBasicWorkzone as IWorkzone));
    workzone.kapschId = 32441;
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

    expect(
      convertIWorkzoneToIConnectWorkzone({
        workzoneAppSettings,
        workzone,
      }),
    ).toMatchSnapshot();
  });
});
