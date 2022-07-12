import {IWorkzone} from "mhc-server";

export const cimDefreezeDates = (cim: IWorkzone): IWorkzone => {
  return {
    ...cim,
    start: new Date(cim.start),
    end: new Date(cim.end),
  };
};
