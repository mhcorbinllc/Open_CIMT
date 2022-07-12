import {IValidationDataResults} from "core-library/dist/commonJs/validation-engine";
import {IUIWorkzone} from "../IUIWorkzone";

export const getValidationErrorByProps = (validationErrors: IValidationDataResults<IUIWorkzone>, props: string[]): string => {
  return props
    .map(prop => validationErrors[prop])
    .filter(Boolean)
    .join('\n');
};
