import {
  EWZTXMode,
  IItisCode,
  EWZClosureSelectionMode,
  IWorkzonesAppSettings,
  getRemovedSimpleClosureTypeItisCodes,
} from "../interfaces/IWorkzonesAppSettings";

import {IValidateDataEngineRules} from "core-library/dist/commonJs/validation-engine";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";
import {convertEnumKeyToHumanReadable} from "../../../utils/convertEnumKeyToHumanReadable";
// This is the complete validation for the CIMs App Settings

export const validateWorkzonesAppSettings: IValidateDataEngineRules<IWorkzonesAppSettings> = {
  deviceId: (deviceId: string) => {
    if (deviceId !== '*') return "Only device id '*' is supported";
    return true;
  },
  psid: (psid: string) => {
    if (!validateDataMethods.hasValue(psid)) return 'Required';
    if (psid.includes(' ')) return 'Should not have spaces';
    return validateDataMethods.isTextIntegerInRangeValidationMessage(psid, 0, 65535);
  },
  serviceChannel: (serviceChannel: string) => {
    const validServiceChannels = '172,180,183,SCH'.split(',');
    if (!validateDataMethods.hasValue(serviceChannel)) return 'Required';
    if (!validateDataMethods.isString(serviceChannel)) return 'Is not a string';
    if (!validateDataMethods.isStringInArray(serviceChannel, validServiceChannels)) return `Should be one of these: ${validServiceChannels.join(', ')}`;
    return true;
  },
  txmode: (txmode: EWZTXMode) => validateDataMethods.isEnumValueValidationMessage(txmode, EWZTXMode),
  intervalInMs: (intervalInMs: number) => validateDataMethods.isIntegerInRangeValidationMessage(intervalInMs, 0, 5000),
  priority: (priority: number) => {
    if (!validateDataMethods.hasValue(priority)) return 'Required';
    if (!validateDataMethods.isNumber(priority)) return 'Is not a number';
    return validateDataMethods.isIntegerInRangeValidationMessage(priority, 0, 63);
  },
  closureSelectionMode: closureSelectionMode => validateDataMethods.isEnumValueValidationMessage(closureSelectionMode, EWZClosureSelectionMode),
  useSignature: (useSignature: any) => {
    if (!validateDataMethods.hasValue(useSignature)) return 'Required';
    if (!validateDataMethods.isBoolean(useSignature)) return 'Should be boolean true or false';
    return true;
  },
  useEncryption: (useEncryption: any) => {
    if (!validateDataMethods.hasValue(useEncryption)) return 'Required';
    if (!validateDataMethods.isBoolean(useEncryption)) return 'Should be boolean true or false';
    return true;
  },
  itisCodes: (itisCodes: IItisCode[]) => {
    if (!validateDataMethods.hasValue(itisCodes)) return 'Required';
    if (!validateDataMethods.isArray(itisCodes)) return 'Should be array';
    const errors: string[] = [];
    itisCodes.forEach(itisCode => {
      const reportItisCode = JSON.stringify(itisCode, null, 2).replace(/\n/g, '');
      if (!validateDataMethods.hasValue(itisCode.code)) errors.push(`Item: ${reportItisCode} the ITIS code is required`);
      if (!validateDataMethods.isNumber(itisCode.code)) errors.push(`Item: ${reportItisCode} the ITIS code should be integer`);
      if (!validateDataMethods.isInteger(itisCode.code)) errors.push(`Item: ${reportItisCode} the ITIS code should be integer (no decimal points)`);
      if (!validateDataMethods.hasValue(itisCode.label)) errors.push(`Item: ${reportItisCode} the label is required`);
      if (
        !validateDataMethods.isValidText({
          text: itisCode.label,
          minLength: 1,
          maxLength: 30,
        })
      ) {
        errors.push(`Item: ${reportItisCode} the label should be 1..30 characters with no illegal chars`);
      }
    });

    const closureTypesRemovedItisCodes = getRemovedSimpleClosureTypeItisCodes(itisCodes);

    if (closureTypesRemovedItisCodes.length > 0) {
      closureTypesRemovedItisCodes.forEach((closureTypesRemovedItisCode) => {
        if (closureTypesRemovedItisCode.removedItisCodes.length < 2) {
          errors.push(`ITIS code ${closureTypesRemovedItisCode.removedItisCodes.join(', ')} is required for the simple closure type "${convertEnumKeyToHumanReadable(closureTypesRemovedItisCode.closureType)}".`);
        }
        else {
          errors.push(`ITIS codes ${closureTypesRemovedItisCode.removedItisCodes.join(', ')} are required for the simple closure type "${convertEnumKeyToHumanReadable(closureTypesRemovedItisCode.closureType)}".`);
        }
      });
    }

    if (errors.length === 0) {
      const duplicatedItisCodes = validateDataMethods.hasUniqueValues(itisCodes.map(ic => ic.code));
      if (duplicatedItisCodes !== true) errors.push(`These ITIS codes are duplicated: ${duplicatedItisCodes.join(', ')}`);
      const duplicatedLabels = validateDataMethods.hasUniqueValues(itisCodes.map(ic => ic.label));
      if (duplicatedLabels !== true) errors.push(`These labels are duplicated: ${duplicatedLabels.join(', ')}`);
    }

    return errors.join('\n');
  },
  createdAt: () => true,  // Ignore them since are overwritten by the db methods anyway
  updatedAt: () => true,
  deletedAt: () => true,
};
