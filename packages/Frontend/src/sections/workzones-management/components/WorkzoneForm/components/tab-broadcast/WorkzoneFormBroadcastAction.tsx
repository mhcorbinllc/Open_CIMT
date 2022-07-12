import {useState} from "react";
import {IDynaError} from "dyna-error";

import {validationEngine} from "core-library/dist/commonJs/validation-engine";

import {Box} from "mhc-ui-components/dist/Box";
import {IsLoading} from "mhc-ui-components/dist/IsLoading";
import {
  Alert,
  EAlertType,
} from "mhc-ui-components/dist/Alert";
import {ErrorBanner} from "mhc-ui-components/dist/ErrorBanner";
import {
  Button,
  EButtonSize,
} from "mhc-ui-components/dist/Button";
import {
  IUseFormApi,
  EViewMode,
} from "mhc-ui-components/dist/useForm";

import {
  IUIWorkzone,
  uiWorkzoneValidationRulesForBroadcast,
} from "../../IUIWorkzone";

import {ValidationErrors} from "./components/ValidationErrors";

import {apiWorkzoneItemBroadcastPost} from "../../../../api/apiWorkzoneItemBroadcastPost";

import {
  useTheme,
  SxProps,
} from "mhc-ui-components/dist/ThemeProvider";
import ValidateIcon from "@mui/icons-material/PlaylistAddCheck";
import BroadcastAction from "@mui/icons-material/RssFeed";

export interface IWorkzoneFormBroadcastActionProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
  allowBroadcast: boolean;
}

export const WorkzoneFormBroadcastAction = (props: IWorkzoneFormBroadcastActionProps): JSX.Element => {
  const {
    useFormApi,
    useFormApi: {
      viewMode,
      isLoading: isFormLoading,
      isChanged: isFormChanged,
      data: workzone,
      data: {workzoneId},
      setValidationResult,
      change,
      buttons: {edit: {disabled}},
    },
    allowBroadcast,
  } = props;
  const theme = useTheme();

  const shouldSave: boolean = viewMode === EViewMode.EDIT || isFormChanged;

  const [isBroadcastLoading, setIsBroadcastLoading] = useState(false);
  const [successBroadcast, setSuccessBroadcast] = useState(false);
  const [broadcastError, setBroadcastError] = useState<IDynaError | undefined>(undefined);
  const [updatedRSUs, setUpdatedRSUs] = useState<number>(0);

  const validateWorkzoneForBroadcast = (workzone: IUIWorkzone): boolean => {
    const validationResult = validationEngine(workzone, uiWorkzoneValidationRulesForBroadcast);
    setValidationResult(validationResult);
    return validationResult.isValid;
  };

  const handleValidateClick = async (): Promise<void> => {
    let savedWorkzone: IUIWorkzone | null = null;
    if (shouldSave) savedWorkzone = await useFormApi.save();
    const validateWorkzone: IUIWorkzone = savedWorkzone || workzone;
    setSuccessBroadcast(false);
    validateWorkzoneForBroadcast(validateWorkzone);
  };
  const handleBroadcastClick = async (): Promise<void> => {
    if (!window.confirm(`Are you sure you want to ${shouldSave ? 'Save & ' : ''}Broadcast?`)) return;

    if (shouldSave) await useFormApi.save();

    if (!validateWorkzoneForBroadcast(workzone)) return;

    try {
      setBroadcastError(undefined);
      setSuccessBroadcast(false);
      setIsBroadcastLoading(true);
      const response = await apiWorkzoneItemBroadcastPost(workzoneId);
      change({kapschId: response.kapschId}, true);
      setSuccessBroadcast(true);
      setUpdatedRSUs(response.updatedRSUs);
    }
    catch (e: any) {
      const error: IDynaError = {
        ...e,
        userMessage: `Cannot broadcast\n${e.userMessage || 'unknown error'}`,
      };
      setValidationResult(e.validationErrors || null);
      console.error('Cannot broadcast', {workzoneId}, e);
      setBroadcastError(error);
    }
    finally {
      setIsBroadcastLoading(false);
    }
  };

  const sxButton: SxProps = {
    margin: theme.spacing(2),
    width: 250,
    [theme.breakpoints.between('xs', 'sm')]: {
      margin: theme.spacing(1),
      width: '95%',
    },
  };

  return (
    <Box dataComponentName="WorkzoneFormBroadcastAction">
      <ValidationErrors
        useFormApi={useFormApi}
        successTitle="CIM is valid for broadcast"
        errorTitle="CIM has some issues"
        errorHelpText="Go through the tabs and correct the red indicated fields."
      />
      <Alert
        type={EAlertType.SUCCESS}
        show={successBroadcast}
        title="CIM successfully broadcast."
      >
        <strong>{updatedRSUs}</strong> RSU{updatedRSUs ? 's' : ''} updated.
      </Alert>
      <Alert
        type={EAlertType.WARNING}
        show={!allowBroadcast}
        title="You do not have permission to broadcast."
      />
      <ErrorBanner error={broadcastError}/>

      <IsLoading isLoading={isBroadcastLoading}>
        <div>
          <Button
            sx={sxButton}
            size={EButtonSize.XXLARGE}
            disabled={
              !allowBroadcast
              || isFormLoading
              || disabled
            }
            icon={<ValidateIcon/>}
            onClick={handleValidateClick}
          >
            {shouldSave ? 'Save & ' : ''}
            Validate
          </Button>
        </div>
        <div>
          <Button
            sx={sxButton}
            size={EButtonSize.XXLARGE}
            disabled={
              !allowBroadcast
              || isFormLoading
              || isBroadcastLoading
              || disabled
            }
            icon={<BroadcastAction/>}
            onClick={handleBroadcastClick}
          >
            {shouldSave ? 'Save & ' : ''}
            Broadcast
          </Button>
        </div>
      </IsLoading>
    </Box>
  );
};
