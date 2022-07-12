import {IWorkzone} from "./IWorkzone";

export interface IDBWorkzone extends IWorkzone {
  dbSearchText: string;
}

export const convertIWorkzoneToIDBWorkzone = (workzone: IWorkzone): IDBWorkzone => {
  const dbWorkzone: IDBWorkzone = {...workzone} as any;
  dbWorkzone.dbSearchText = [
    workzone.workzoneId,
    workzone.kapschId,
    workzone.itisCodes.join(', '),
    workzone.name,
    workzone.notes,
  ]
    .filter(Boolean)
    .join(' ');

  return dbWorkzone;
};

export const convertIDBWorkzoneToIWorkzone = (dbWorkzone: IDBWorkzone): IWorkzone => {
  const workzone: IWorkzone = {...dbWorkzone};
  workzone.start = new Date(workzone.start);
  workzone.end = new Date(workzone.end);
  delete (workzone as any)._id;
  delete (workzone as any).dbSearchText;

  return workzone;
};
