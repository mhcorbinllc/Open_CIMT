import {IWorkzone} from "./IWorkzone";
import {getDefaultAppItisCodes} from "./getDefaultAppItisCodes";
import {closureTypePresetValues} from "./closureTypePresetValues";
// App settings per company (not per device or user).

export interface IWorkzonesAppSettings {
  // See the apiWorkzonesAppSettingPost.ts's validation for the valid options per property

  deviceId: string;           // PK, "*" is for all devices of the company

  serviceChannel: string;
  psid: string;               // Courier font type
  txmode: EWZTXMode;
  intervalInMs: number;
  priority: number;           // 0..63
  useSignature: boolean;
  useEncryption: boolean;
  closureSelectionMode: EWZClosureSelectionMode;

  itisCodes: IItisCode[];

  createdAt: number;
  updatedAt: number;
  deletedAt: number;
}

export enum EWZTXMode {
  CONT = "CONT",
  ALT = "ALT",
}

export enum EWZClosureSelectionMode {
  CUSTOM = "CUSTOM",
  SIMPLE = "SIMPLE",
}

export interface IItisCode {
  code: number;
  label: string;
}

export const defaultWorkzoneAppSettings: IWorkzonesAppSettings = {
  deviceId: '',
  serviceChannel: "172",
  psid: '8002',
  txmode: EWZTXMode.CONT,
  intervalInMs: 1000,
  priority: 4,
  useSignature: false,
  useEncryption: false,
  closureSelectionMode: EWZClosureSelectionMode.SIMPLE,
  itisCodes: getDefaultAppItisCodes(),
  createdAt: 0,
  updatedAt: 0,
  deletedAt: 0,
};

export interface IValidationErrorItisRemoveBlockedByWorkzone {
  removedItisCodes: number[];
  workzone: IWorkzone;
}

export interface IClosureTypeRemovedItisCodes {
  closureType: string;
  removedItisCodes: number[];
}

export const getRemovedSimpleClosureTypeItisCodes  = (
  itisCodes: IItisCode[],
): IClosureTypeRemovedItisCodes[] => {
  const closureTypeRemovedItisCodes: IClosureTypeRemovedItisCodes[] = [];
  const codesList = itisCodes.map(itisCode => (itisCode.code));
  Object.keys(closureTypePresetValues)
    .forEach((key) => {
      const newRecord: IClosureTypeRemovedItisCodes = {
        closureType: key,
        removedItisCodes: [],
      };
      closureTypePresetValues[key].itisCodes
        .forEach((cti: number) => {
          const exists = codesList.includes(cti);
          if (exists) return;
          newRecord.removedItisCodes.push(cti);
        });
      closureTypeRemovedItisCodes.push(newRecord);
    });

  return closureTypeRemovedItisCodes.filter(closureType => closureType.removedItisCodes.length > 0);
};
