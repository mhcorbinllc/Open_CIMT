import {
  IGeoPoint,
  API_PATH_apiGeoPointElevationGet,
  IApiGeoPointElevationGetResponse,
  IApiGeoPointElevationGetRequest,
} from "mhc-server";

import {apiFetch} from "../../../api/apiFetch";
import {getOnline} from "../../../utils/getOnline";

// Note: This endpoint returns the altitude in meters (not in feet).
export const apiGeoPointElevationGet = async (positions: IGeoPoint[]): Promise<IGeoPoint[]> => {
  return getOnline()
    ? apiGeoPointElevationGetOnline(positions)
    : positions.map(position => {
      return {
        lat: position.lat,
        lng: position.lng,
        alt: 0,
      };
    }); // Return alt with 0
};

const apiGeoPointElevationGetOnline = async (positions: IGeoPoint[]): Promise<IGeoPoint[]> => {
  const response = await apiFetch.request<void, IApiGeoPointElevationGetResponse, IApiGeoPointElevationGetRequest>({
    path: API_PATH_apiGeoPointElevationGet,
    query: {positions},
  });
  return response.positions;
};
