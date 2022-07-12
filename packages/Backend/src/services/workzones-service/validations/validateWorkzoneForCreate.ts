import {IWorkzone} from "../interfaces/IWorkzone";

import {IValidateDataEngineRules} from "core-library/dist/commonJs/validation-engine";
import {validateDataMethods} from "core-library/dist/commonJs/validation-engine";
import {validateWorkzoneForUpdate} from "./validateWorkzoneForUpdate";

// This is very limited validation, we check only security and if the props exist and have correct type.
// We don't validate the logic or if the values are right since we allow the user , this is done on broadcast.

export const validateWorkzoneForCreate: IValidateDataEngineRules<IWorkzone> = {
  ...validateWorkzoneForUpdate,
  workzoneId: (workzoneId: string) => {
    if (!validateDataMethods.isString(workzoneId)) return 'Should be a string';
    if (workzoneId.trim()) return 'Should not provide workzoneId on Create';
    return true;
  },
};
