import {IGeoPoint} from "../interfaces/IWorkzone";

export const API_PATH_apiGeoPointElevationGet = "/services/workzones-management/item/elevation";

export interface IApiGeoPointElevationGetRequest {
  positions: IGeoPoint[];
}

export interface IApiGeoPointElevationGetResponse {
  positions: IGeoPoint[]; // Altitude is in meters
}
