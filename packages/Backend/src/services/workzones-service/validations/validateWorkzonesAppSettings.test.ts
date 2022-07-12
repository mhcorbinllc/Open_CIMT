import {
  IWorkzonesAppSettings,
} from "../interfaces/IWorkzonesAppSettings";

import {defaultWorkzoneAppSettings} from "../interfaces/IWorkzonesAppSettings";
import {validationEngine} from "core-library/dist/commonJs/validation-engine";

import {validateWorkzonesAppSettings} from "./validateWorkzonesAppSettings";

const appSettings: IWorkzonesAppSettings = {
  ...defaultWorkzoneAppSettings,
  deviceId: "*",
};

describe('validateWorkzonesAppSettings', () => {
  test('Default App Settings with device id set is valid', () => {
    expect(validationEngine(appSettings, validateWorkzonesAppSettings)).toMatchSnapshot();
  });

  test('Fails when missing itis codes needed for simple closure types', () => {
    appSettings.itisCodes = appSettings.itisCodes.filter(itisCode => itisCode.code !== 8720);
    expect(validationEngine(appSettings, validateWorkzonesAppSettings)).toMatchSnapshot();
  });
});
