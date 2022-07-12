export const API_PATH_ApiWorkzonesManagementOfflineImportPost = '/services/workzones-management/offline-import';

export interface IApiWorkzonesManagementOfflineImportPostBodyRequest {
  collectionName: 'workzoneAppSettings' | 'workzones';
  doc: any;
  offlineAction: EOfflineAction;
}

export enum EOfflineAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  UNDELETE = "UNDELETE",
  PERMANENT_DELETE = "PERMANENT_DELETE",
}
export interface IApiWorkzonesManagementOfflineImportPostResponse {
  applied?: boolean;
  noAppliedReason?: string;
  updatedDoc?: any;
}

