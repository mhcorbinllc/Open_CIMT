import axios, {AxiosError} from 'axios';
import {dynaError} from "dyna-error";

import {IGeoPoint} from '../../interfaces/IWorkzone';

export interface IElevation {
  latitude: number;
  longitude: number;
  elevation: number;
}

// Dev note, currently (and probably forever) then Open Elevation is not working.
// For more read: https://github.com/Jorl17/open-elevation/issues/58
export const apiOpenElevationGet = async (positions: IGeoPoint[]): Promise<IElevation[]> => {
  const locationsQuery =
    "?locations="
    + positions
      .map((
        {
          lat,
          lng,
        },
      ) => [lat, lng]
        .map(v => v.toString()))
      .join("|");

  try {
    const path = [
      'https://api.open-elevation.com/api/v1/lookup',
      locationsQuery,
    ].join('');
    const {data: {results}} = await axios.get<{ results: IElevation[] }>(
      path,
      {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      },
    );

    return results;
  }
  catch (e) {
    const axiosError: AxiosError = e;
    const error = dynaError({
      code: 202110261119,
      status: 503,
      message: `Elevation API service responded with an error status: ${axiosError.response?.status} - ${axiosError.message}`,
      userMessage: 'Error retrieving elevation for GeoPoint, please set the elevation manually using the input coordinates editor on the map.',
      parentError: e,
    });
    console.error('apiOpenElevationGet, 3rd party service has problem', error.message, error);
    throw error;
  }
};
