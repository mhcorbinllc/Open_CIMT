import {
  IWorkzonesAppSettings,
  EWZTXMode,
  EWZClosureSelectionMode,
} from "mhc-server";

export const emptyWorkzonesAppSettings: IWorkzonesAppSettings = {
  deviceId: '',
  serviceChannel: "0",
  psid: '',
  txmode: EWZTXMode.CONT,
  intervalInMs: 0,
  priority: 4,
  useSignature: false,
  useEncryption: false,
  closureSelectionMode: EWZClosureSelectionMode.SIMPLE,
  itisCodes: [],
  createdAt: 0,
  updatedAt: 0,
  deletedAt: 0,
};
