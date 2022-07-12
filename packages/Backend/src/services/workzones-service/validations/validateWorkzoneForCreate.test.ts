import {
  EWZHeading,
  IWorkzone,
} from "../interfaces/IWorkzone";

import {getDefaultWorkzone} from "../interfaces/getDefaultWorkzone";
import {validationEngine} from "core-library/dist/commonJs/validation-engine";

import {validateWorkzoneForCreate} from "./validateWorkzoneForCreate";

describe('validateWorkzoneForCreate', () => {
  test('Missing workzoneId (correct)', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...getDefaultWorkzone(),
      name: 'Demo CIM',
    }));

    workzone.heading = [EWZHeading.EAST];

    const validation = validationEngine(workzone, validateWorkzoneForCreate);

    expect(validation.isValid).toBeTruthy();
    expect(validation).toMatchSnapshot();
  });

  test('Providing workzoneId (wrong)', () => {
    const workzone: IWorkzone = JSON.parse(JSON.stringify({
      ...getDefaultWorkzone(),
      name: 'Demo CIM',
      workzoneId: 'ed-98467204',
    }));

    workzone.heading = [EWZHeading.EAST];

    const validation = validationEngine(workzone, validateWorkzoneForCreate);

    expect(validation.isValid).toBeFalsy();
    expect(validation.messages.length).toBe(1);
    expect(validation).toMatchSnapshot();
  });
});
