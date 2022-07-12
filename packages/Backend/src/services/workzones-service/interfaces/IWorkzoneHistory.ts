import {IWorkzone} from "./IWorkzone";

export interface IWorkzoneHistory {
  date: number;
  name: string;
  userId: string;
  workzone: IWorkzone;
}

export interface IDBWorkzoneHistory extends IWorkzoneHistory {
  dbSearchText: string;
}

// DB

export const convertIWorkzoneHistoryToIDBWorkzoneHistory = (workzoneHistory: IWorkzoneHistory): IDBWorkzoneHistory => {
  const dbWorkzoneHistory: IDBWorkzoneHistory = {...workzoneHistory} as any;
  dbWorkzoneHistory.dbSearchText = [
    workzoneHistory.name,
    workzoneHistory.workzone.name,
    workzoneHistory.workzone.notes,
  ]
    .filter(Boolean)
    .join(' ');
  return dbWorkzoneHistory;
};

export const convertIDBWorkzoneHistorytoIWorkzoneHistory = (dbWorkzoneHistory: IDBWorkzoneHistory): IWorkzoneHistory => {
  const workzoneHistory: IWorkzoneHistory = {...dbWorkzoneHistory};
  delete (workzoneHistory as any)._id;
  delete (workzoneHistory as any).dbSearchText;

  return workzoneHistory;
};
