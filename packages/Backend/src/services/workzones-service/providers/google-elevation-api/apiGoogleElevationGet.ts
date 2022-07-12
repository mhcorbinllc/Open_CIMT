import {guid} from "dyna-guid";
import {dynaError} from "dyna-error";

import {apiFetch} from "../../../../utils/apiFetch";

export interface IGeoPoint {
  lat: number;
  lng: number;
  alt?: number;
}

interface IGoogleElevationsResponse {
  results: {
    elevation: number;
    location: {
      lat: number;
      lng: number;
    };
    resolution: number;
  }[];
  status: 'ok' | any;
  error_message?: string;
}

export const apiGoogleElevationGet = async (positions: IGeoPoint[]): Promise<IGeoPoint[]> => {
  let response: IGoogleElevationsResponse | null = null;

  try {
    response = await apiFetch<{locations: string; key: string}, void, IGoogleElevationsResponse>(
      {
        method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/elevation/json',
        query: {
          locations: positions
            .map((
              {
                lat,
                lng,
              },
            ) => [lat, lng]
              .map(v => v.toString()))
            .join("|"),
          key: process.env.GOOGLE_MAP_ELEVATION_API_KEY || '',
        },
      },
    );
  }
  catch (e) {
    const errorId = guid();
    const error = dynaError({
      code: 202110261119,
      status: 503,
      message: `Google Elevation API service responded error. Check server logs with error id ${errorId}.`,
      parentError: e,
    });
    console.error(error.message, error);
    throw error;
  }
  if (!response) return []; // 4TS

  const {
    results,
    status,
    error_message,
  } = response;

  if (status !== 'OK') {
    const error = dynaError({
      code: 202202150942,
      status: 503,
      message: `Google API Elevation responded with error status [${status}]: ${error_message || 'Unknown error'}. Check server logs with error id ${guid()}.`,
      data: {
        requestedPosition: positions,
        response,
      },
    });
    console.error(error.message, error);
    throw error;
  }

  return results.map(result=>({
    lat: result.location.lat,
    lng: result.location.lng,
    alt: result.elevation,
  }));
};
