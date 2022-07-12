import {
  IGeoPoint,
  IGeoLine,
  IGeoPolygon,
  EWZHeading,
} from "./IWorkzone";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";

export const validateWorkzoneElements = {
  isValidGeoPoint: (point: IGeoPoint): string | true => {
    if (!point) return 'Required';
    if (!validateDataMethods.isNumberInRange(point.lat, -180, 180)) return 'Lat should be -180..180';
    if (!validateDataMethods.isNumberInRange(point.lng, -180, 180)) return 'Lng should be -180..180';
    if (point.alt !== undefined && !validateDataMethods.isNumber(point.alt)) return 'Alt is not a number';
    return true;
  },
  isValidPoints: (points: IGeoPoint[]): string | true => {
    let error: string | null = null;
    if (!Array.isArray(points)) return 'points array is not array';
    points.forEach((point, index) => {
      if (error) return;
      const validationResult = validateWorkzoneElements.isValidGeoPoint(point);
      if (validationResult !== true) error = `Point no [${index + 1}]: ${validationResult}`;
    });

    return error === null
      ? true
      : error;
  },
  isValidGeoLine: (geoLine: IGeoLine): string | true => {
    if (!geoLine) return 'Required';
    if (!geoLine.points) return 'points array is missing';
    if (!Array.isArray(geoLine.points)) return 'points array is not array';
    return validateWorkzoneElements.isValidPoints(geoLine.points);
  },
  isValidGeoPolygon: (polygon: IGeoPolygon): string | true => {
    if (!polygon) return 'Required';
    const pointsValidation = validateWorkzoneElements.isValidPoints(polygon.points);
    if (pointsValidation !== true) return pointsValidation;
    if (polygon.points.length <= 3) return 'Not enough points for a polygon';
    if (polygon.points.length) {
      const start = polygon.points[0];
      const end = polygon.points[polygon.points.length - 1];
      if (
        start.lat !== end.lat
        || start.lng !== end.lng
        || start.alt !== end.alt
      ) return "The last point should match the start point to close the polygon";
    }
    return true;
  },
  isValidGeoAreaPolygon: (polygon: IGeoPolygon): string | true => {
    const isValidGeoPolygon = validateWorkzoneElements.isValidGeoPolygon(polygon);
    if (!validateDataMethods.isValid(isValidGeoPolygon)) return isValidGeoPolygon;
    const uniqueLat: number[] = [];
    const uniqueLng: number[] = [];
    polygon.points.forEach(point => {
      if (uniqueLat.indexOf(point.lat) === -1) uniqueLat.push(point.lat);
      if (uniqueLng.indexOf(point.lng) === -1) uniqueLng.push(point.lng);
    });
    if (uniqueLng.length === 1) return 'This polygon is a line, not a shape';
    return true;
  },
  isValidHeading: (heading: EWZHeading): string | true => {
    if (!heading) return 'Required';
    if (!validateDataMethods.isEnumValue(heading, EWZHeading)) return 'Not a valid secondary intercardinal direction';
    return true;
  },
  isValidHeadings: (headings: EWZHeading[]): string | true => {
    let error: string | null = null;
    if (!Array.isArray(headings)) return 'Headings array is not an array';
    headings.forEach((heading, index) => {
      if (error) return;
      const validationResult = validateWorkzoneElements.isValidHeading(heading);
      if (validationResult !== true) error = `No Heading [${index + 1}]: ${validationResult}`;
    });

    return error === null
      ? true
      : error;
  },
};
