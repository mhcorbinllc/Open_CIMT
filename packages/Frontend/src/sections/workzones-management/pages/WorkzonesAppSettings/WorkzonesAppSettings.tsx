import {useState} from "react";

import {connect} from "react-dynadux";
import {dynaSwitch} from "dyna-switch";
import {Prompt} from "react-router";

import {
  IWorkzonesAppSettings,
  EWorkZonesManagementRights,
  EWZTXMode,
  EWZClosureSelectionMode,
  validateWorkzonesAppSettings,
} from "mhc-server";

import {IAppStore} from "../../../../state/IAppStore";

import {
  GridContainer,
  GridItem,
} from "mhc-ui-components/dist/Grid";
import {
  FlexContainerVertical,
  FlexContainerResponsive,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";
import {
  Alert,
  EAlertType,
} from "mhc-ui-components/dist/Alert";
import {IsLoading} from "mhc-ui-components/dist/IsLoading";
import {FormToolbar} from "mhc-ui-components/dist/FormToolbar";
import {ErrorBanner} from "mhc-ui-components/dist/ErrorBanner";
import {
  Input,
  EInputType,
} from "mhc-ui-components/dist/Input";
import {InputSelect} from "mhc-ui-components/dist/InputSelect";
import {InputSwitch} from "mhc-ui-components/dist/InputSwitch";
import {
  useForm,
  EViewMode,
  EFormType,
} from "mhc-ui-components/dist/useForm";
import {
  convertEnumToIInputSelectOptions,
} from "mhc-ui-components/dist/utils";

import {emptyWorkzonesAppSettings} from "./emptyWorkzonesAppSettings";

import {OfflineInfo} from "../../components/OfflineInfo/OfflineInfo";

import {
  IOfflineInfo,
  EOfflineStatus,
} from "../../api/interfaces";
import {apiWorkzoneAppSettingsLoad} from "../../api/apiWorkzoneAppSettingsLoad";
import {apiWorkzoneAppSettingsSave} from "../../api/apiWorkzoneAppSettingsSave";

import {ItisCodesEditor} from "./component/ItisCodesEditor";

import SettingsIcon from "@mui/icons-material/Tune";

export interface IWorkzonesAppSettingsProps {
  store: IAppStore;
}

export const WorkzonesAppSettings = connect((props: IWorkzonesAppSettingsProps): JSX.Element => {
  const {
    store: {
      app: {state: {online}},
      userAuth: {
        state: {
          user: {
            userId,
            companyId,
          },
        },
        utils: {userHasAllRights},
      },
      workzonesManagement: {actions: {refreshOfflineItemsCounter}},
    },
  } = props;

  const userCanAccess = userHasAllRights([EWorkZonesManagementRights.WORKZONES_EDIT]);

  const [offlineInfo, setOfflineInfo] = useState<IOfflineInfo>({
    status: EOfflineStatus.ACTUAL_VERSION,
    userMessage: '',
  });

  const useFormApi = useForm<IWorkzonesAppSettings, string>({
    formType: EFormType.VIEW_EDIT,
    loadDataId: '*', // Settings have no Id, we just pass something to start the load.
    emptyFormData: emptyWorkzonesAppSettings,
    userCanEdit: userCanAccess,

    validationRules: validateWorkzonesAppSettings,

    onApiGet: async () => {
      const response = await apiWorkzoneAppSettingsLoad(companyId, userId);
      setOfflineInfo(response.offlineInfo);
      return response.data;
    },
    onApiPut: async (settings) => {
      setOfflineInfo({
        status: EOfflineStatus.ACTUAL_VERSION,
        userMessage: '',
      });
      const response = await apiWorkzoneAppSettingsSave(companyId, userId, settings);
      if (!online) refreshOfflineItemsCounter();
      setOfflineInfo(response.offlineInfo);
    },
  });

  const {
    data: {
      psid,
      serviceChannel,
      txmode,
      intervalInMs,
      priority,
      useSignature,
      useEncryption,
      closureSelectionMode,
      itisCodes,
    },
    viewMode,
    alert,
    isChanged,
    isLoading,
    loadFatalError,
    validationResult: {
      dataValidation: validationErrors,
      customValidation,
    },
    change,
    formProps,
  } = useFormApi;

  const readOnly = viewMode === EViewMode.VIEW;

  if (loadFatalError) {
    return (
      <ErrorBanner
        defaultErrorMessage="Cannot load settings"
        error={loadFatalError}
      />
    );
  }

  return (
    <form
      style={{
        height: '100%',
        maxWidth: 800,
        margin: 'auto',
      }}
      {...formProps}
    >
      <Prompt
        when={isChanged}
        message='You have unsaved changes, are you sure you want to leave?'
      />

      <IsLoading
        isLoading={isLoading}
        fullHeight
      >
        <FlexContainerVertical fullHeight>

          <FlexItemMin>
            <FlexContainerResponsive verticalOnMobile>
              <FlexItemMax>
                <SettingsIcon
                  sx={{
                    width: 128,
                    height: 128,
                  }}
                />
              </FlexItemMax>
              <FlexItemMin>
                <FormToolbar useFormApi={useFormApi}/>
              </FlexItemMin>
            </FlexContainerResponsive>

            <Alert
              type={EAlertType.WARNING}
              show={!isLoading && offlineInfo.status !== EOfflineStatus.ACTUAL_VERSION}
              title="Offline warning"
            >
              <OfflineInfo
                offlineInfo={offlineInfo}
              />
            </Alert>
            <Alert
              {...alert}
              show={alert.show && offlineInfo.status === EOfflineStatus.ACTUAL_VERSION}
            />

          </FlexItemMin>

          <FlexItemMax overFlowY>

            <GridContainer spacing={2}>

              <GridItem mobile={12}>
                <Input
                  name="psid"
                  label="PSID"
                  ariaLabel="PSID"
                  required
                  readOnly={readOnly}
                  helperLabel="Decimal"
                  value={psid}
                  validationError={validationErrors.psid}
                />
              </GridItem>

              <GridItem mobile={12} tablet={6}>
                <InputSelect
                  name="serviceChannel"
                  label="Service channel"
                  ariaLabel="Service channel"
                  required
                  readOnly={readOnly}
                  helperLabel="10Mhz spaced channels"
                  options={
                    "172,180,183,SCH"
                      .split(',')
                      .map(v => ({
                        value: v,
                        label: v,
                      }))
                  }
                  value={serviceChannel}
                  validationError={validationErrors.serviceChannel}
                />
              </GridItem>
              <GridItem mobile={12} tablet={6}>
                <InputSelect
                  name="txmode"
                  label="TX mode"
                  ariaLabel="TX mode"
                  required
                  readOnly={readOnly}
                  options={convertEnumToIInputSelectOptions(EWZTXMode)}
                  value={txmode.toString()}
                  validationError={validationErrors.txmode}
                />
              </GridItem>

              <GridItem mobile={12} tablet={6}>
                <Input
                  name="intervalInMs"
                  label="Interval"
                  ariaLabel="Interval"
                  required
                  readOnly={readOnly}
                  type={EInputType.NUMBER}
                  helperLabel="In milliseconds. Valid values: 0..5000"
                  value={intervalInMs.toString()}
                  validationError={validationErrors.intervalInMs}
                />
              </GridItem>
              <GridItem mobile={12} tablet={6}>
                <Input
                  name="priority"
                  label="Priority"
                  ariaLabel="Priority"
                  required
                  readOnly={readOnly}
                  type={EInputType.NUMBER}
                  helperLabel="Valid values: 0..63"
                  value={priority.toString()}
                  validationError={validationErrors.priority}
                />
              </GridItem>

              <GridItem mobile={6}>
                <InputSwitch
                  label="Use signature"
                  ariaLabel="Use signature"
                  value={useSignature}
                  readOnly={readOnly}
                  onChange={v => change({useSignature: v})}
                  validationError={validationErrors.useSignature}
                />
              </GridItem>
              <GridItem mobile={6}>
                <InputSwitch
                  label="Use encryption"
                  ariaLabel="Use encryption"
                  value={useEncryption}
                  readOnly={readOnly}
                  onChange={v => change({useEncryption: v})}
                  validationError={validationErrors.useEncryption}
                />
              </GridItem>

              <GridItem mobile={12} tablet={8}>
                <InputSelect
                  name="closureSelectionMode"
                  label="Default Closure Selection Mode"
                  ariaLabel="Default Closure Selection Mode"
                  readOnly={readOnly}
                  options={convertEnumToIInputSelectOptions(EWZClosureSelectionMode)}
                  value={closureSelectionMode.toString()}
                  helperLabel={
                    dynaSwitch<string>(
                      closureSelectionMode,
                      '',
                      {
                        [EWZClosureSelectionMode.SIMPLE]: `Select CIM Closure by one Simple "Type of closure" drop down.`,
                        [EWZClosureSelectionMode.CUSTOM]: `Select CIM Closure by Custom "Itis codes", "Closed lane" and "Closed shoulder" drop downs`,
                      },
                    )
                  }
                  validationError={validationErrors.closureSelectionMode}
                />
              </GridItem>


              <GridItem mobile={12}>
                <ItisCodesEditor
                  viewMode={viewMode}
                  itisCodes={itisCodes}
                  validationError={{
                    mainError: validationErrors.itisCodes,
                    removeErrorsByWorkzones: customValidation?.workzonesRemovedItisCodes,
                  }}
                  onChange={itisCodes => change({itisCodes})}
                />
              </GridItem>

            </GridContainer>
          </FlexItemMax>

        </FlexContainerVertical>
      </IsLoading>
    </form>
  );
});
