export interface IConnectWorkzone {
  id: number;
  name: string;
  speedlimit: number;    // In miles
  isWorkzone: true;
  areWorkersPresent: boolean;
  shoulder: string;
  lane: string;
  laneWidth: number;  // Int
  start: string;      // ISO string without ms
  end: string;        // ISO string without ms
  forEver: boolean;
  itisCodes: number[];

  point: {
    type: "Point";
    coordinates: (number | null)[];
  };

  heading: string[];

  broadcastRegion: {
    type: "Polygon";
    coordinates: number[][][];
  };

  usePath: boolean;
  path: {
    type: "LineString";
    coordinates: number[][];
  };

  useRadius: boolean;
  radius: number;

  // Broadcast settings
  serviceChannelStr: string;
  psid: string;
  txmode: string;
  interval: number;
  priority: number;
  useSignature: boolean;
  useEncryption: boolean;
}
