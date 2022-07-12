import {IWorkzone} from "./IWorkzone";
import {IConnectWorkzone} from "./IConnectWorkzone";
import {IWorkzonesAppSettings} from "./IWorkzonesAppSettings";

export const convertIWorkzoneToIConnectWorkzone = (
  {
    workzone,
    workzoneAppSettings,
  }: {
    workzone: IWorkzone;
    workzoneAppSettings: IWorkzonesAppSettings;
  },
): IConnectWorkzone => {
  return {
    id: workzone.kapschId,
    name: workzone.name,
    speedlimit: Math.round(workzone.speedLimitInMiles),
    isWorkzone: true,
    areWorkersPresent: workzone.workersPresent,
    shoulder: workzone.closedShoulder,
    lane: workzone.closedLane,
    laneWidth: Math.round(workzone.closedLaneWidthInMeters),
    start: dateToIsoString(workzone.start),
    end: dateToIsoString(workzone.end),
    forEver: workzone.forEver,
    itisCodes: workzone.itisCodes,

    // Point
    point: {
      type: "Point",
      coordinates: [
        workzone.point.lng,
        workzone.point.lat,
        workzone.point.alt === undefined
          ? null
          : workzone.point.alt,
      ],
    },

    heading: workzone.heading,

    // Path
    usePath: !!workzone.path.points.length,
    path: {
      type: "LineString",
      coordinates:
        workzone.path.points
          .map(point => ([
            point.lng,
            point.lat,
            point.alt || 0,
          ])),
    },

    // Selection mode: Region
    broadcastRegion: {
      type: "Polygon",
      coordinates: [
        workzone.broadcast.selectionByRegion.region.points
          .map(point => ([
            point.lng,
            point.lat,
            point.alt || 0,
          ])),
      ],
    },

    // Selection mode: Radius
    useRadius: !!workzone.broadcast.selectionByRadius.radiusInMeters,
    radius: workzone.broadcast.selectionByRadius.radiusInMeters,

    // CIMs features options
    serviceChannelStr: workzoneAppSettings.serviceChannel,
    psid: workzoneAppSettings.psid,
    txmode: workzoneAppSettings.txmode,
    interval: workzoneAppSettings.intervalInMs,
    priority: workzoneAppSettings.priority,
    useSignature: workzoneAppSettings.useSignature,
    useEncryption: workzoneAppSettings.useEncryption,
  };
};

const dateToIsoString = (date: Date | string | number): string => {
  return new Date(date).toISOString()
    .split('.')[0] + "Z";
};
