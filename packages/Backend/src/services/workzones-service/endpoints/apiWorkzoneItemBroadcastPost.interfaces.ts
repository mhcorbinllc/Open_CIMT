export const API_PATH_ApiWorkzoneItemBroadcastPost = '/services/workzones-management/item/broadcast';

export interface IApiWorkzoneItemBroadcastPostBodyRequest {
  workzoneId: string;
}

export interface IApiWorkzoneItemBroadcastPostResponse {
  kapschId: number;
  updatedRSUs: number;
}
