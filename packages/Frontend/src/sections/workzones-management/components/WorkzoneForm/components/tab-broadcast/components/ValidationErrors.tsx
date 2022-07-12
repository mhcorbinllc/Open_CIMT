import {Collapse} from "mhc-ui-components/dist/Collapse";

import {
  Alert,
  EAlertType,
} from "mhc-ui-components/dist/Alert";
import {Box} from "mhc-ui-components/dist/Box";
import {
  IUseFormApi,
  EValidationStatus,
} from "mhc-ui-components/dist/useForm";

import {IUIWorkzone} from "../../../IUIWorkzone";

export interface IValidationErrorsProps {
  successTitle?: string;
  errorTitle?: string;
  errorHelpText?: string;
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const ValidationErrors = (props: IValidationErrorsProps): JSX.Element | null => {
  const {
    successTitle = "Validation is success",
    errorTitle = 'Validation errors',
    errorHelpText,
    useFormApi: {
      validationStatus,
      validationResult: {messages},
    },
  } = props;

  if (validationStatus === EValidationStatus.NONE) return null;

  return (
    <Box dataComponentName="ValidationErrors">

      <Alert
        show={validationStatus === EValidationStatus.SUCCESS}
        type={EAlertType.SUCCESS}
        title={successTitle}
      />

      <Collapse expanded={validationStatus === EValidationStatus.FAILED}>
        <Alert
          type={EAlertType.WARNING}
          title={errorTitle}
        >
          {errorHelpText}
        </Alert>
        <ul>
          {messages
            .map((message, index) => {
              return (
                <li key={index}>
                  {message}
                </li>
              );
            })}
        </ul>
      </Collapse>

    </Box>
  );
};
