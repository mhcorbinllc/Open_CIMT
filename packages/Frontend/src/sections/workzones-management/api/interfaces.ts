export interface IOfflineInfo {
  status: EOfflineStatus;
  userMessage: string;
}

export enum EOfflineStatus {
  ACTUAL_VERSION = "ACTUAL_VERSION",          // The item(s) is loaded from server side
  OFFLINE_VERSION = "OFFLINE_VERSION",        // The item is loaded from offline resource
  CREATED_OFFLINE = "CREATED_OFFLINE",
  UPDATED_OFFLINE = "UPDATED_OFFLINE",
  DELETED_OFFLINE = "DELETED_OFFLINE",
  UNDELETED_OFFLINE = "UNDELETED_OFFLINE",
  MIXED_LIST_CONTENT = "MIXED_LIST_CONTENT",  // Used for lists only
}

export interface IDataWithOfflineInfo<TData> {
  data: TData;
  offlineInfo: IOfflineInfo;
}
