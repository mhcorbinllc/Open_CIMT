import {DynaMongoDB} from "dyna-mongo-db";

import {IWorkzonesAppSettings} from "../interfaces/IWorkzonesAppSettings";
import {IDBWorkzone} from "../interfaces/IDBWorkzone";
import {IDBWorkzoneHistory} from "../interfaces/IWorkzoneHistory";

import {getCollection} from "../../../utils/getCollection";

export const getWorkzonesAppSettingsCollection = (dmdb: DynaMongoDB, companyId: string) =>
  getCollection<IWorkzonesAppSettings>(dmdb, companyId, 'workzones-app-settings');

export const getWorkzonesItemsCollection = (dmdb: DynaMongoDB, companyId: string) =>
  getCollection<IDBWorkzone>(dmdb, companyId, 'workzones-items');

export const getWorkzonesItemsHistoryCollection = (dmdb: DynaMongoDB, companyId: string) =>
  getCollection<IDBWorkzoneHistory>(dmdb, companyId, 'workzones-items-history');
