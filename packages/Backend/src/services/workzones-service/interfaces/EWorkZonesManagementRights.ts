import {convertDictionaryToViewLabelArray} from "../../../utils/convertDictionaryToViewLabelArray";

export enum EWorkZonesManagementRights {
  WORKZONES_VIEW = "WZM_V",
  WORKZONES_EDIT = "WZM_E",
}

const labelsDic: Record<EWorkZonesManagementRights, string>  = {
  [EWorkZonesManagementRights.WORKZONES_VIEW]: 'CIMs / View',
  [EWorkZonesManagementRights.WORKZONES_EDIT]: 'CIMs / Edit',
};

export const EWorkZonesManagementRightsArray = convertDictionaryToViewLabelArray(labelsDic);
