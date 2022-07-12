import * as React from "react";
import {IDynaError} from "dyna-error";
import {syncPromises} from "dyna-sync";
import {connect} from "react-dynadux";
import {dynaSwitch} from "dyna-switch";

import {Box} from "mhc-ui-components/dist/Box";
import {ButtonBar} from "mhc-ui-components/dist/ButtonBar";
import {
  GridContainer,
  GridItem,
} from "mhc-ui-components/dist/Grid";
import {
  FlexContainerVertical,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";
import {Typography} from "mhc-ui-components/dist/Typography";
import {
  Button,
  EButtonColor,
} from "mhc-ui-components/dist/Button";
import {ErrorBanner} from "mhc-ui-components/dist/ErrorBanner";
import {InputSlider} from "mhc-ui-components/dist/InputSlider";

import {IWorkzone} from "mhc-server";

import {IAppStore} from "../../../../state/IAppStore";

import {apiWorkzoneAppSettingsLoad} from "../../api/apiWorkzoneAppSettingsLoad";
import {apiWorkzonesForOfflineUseGet} from "../../api/apiWorkzonesForOfflineUseGet";

import {browserDbWorkzoneUpdate} from "../../api/browserDb/entities/workzone/browserDbWorkzoneUpdate";

import UnknownStatusIcon from "@mui/icons-material/Help";
import DownloadedIcon from "@mui/icons-material/GetApp";
import SavingIcon from "@mui/icons-material/SaveAlt";
import SavedIcon from "@mui/icons-material/DoneOutline";
import SaveFailed from "@mui/icons-material/Error";

const LOAD_LIMIT = 7;

export interface IWorkzonesPrepareForOfflineProps {
  store: IAppStore;
}

interface IWorkzonesPrepareForOfflineState {
  months: number;

  isLoading: boolean;
  isCanceled: boolean;
  loadError: IDynaError | null | unknown;

  workzones: Array<{
    workzone: IWorkzone;
    saveStatus: ESaveStatus;
    error: string;
  }>;
}

enum ESaveStatus {
  DOWNLOADED = "DOWNLOADED",
  SAVING = "SAVING",
  SAVED = "SAVED",
  SAVE_FAILED = "SAVE_FAILED",
}

class WorkzonesPrepareForOffline_ extends React.Component<IWorkzonesPrepareForOfflineProps, IWorkzonesPrepareForOfflineState> {
  private refWorkzonesList = React.createRef<any>();

  public state: IWorkzonesPrepareForOfflineState = {
    months: 3,
    isLoading: false,
    isCanceled: false,
    loadError: null,
    workzones: [],
  };

  public componentDidMount(): void {
    this.props.store.userAuth.actions.refreshToken(2);
  }

  private handleMonthsChange = (months: number): void => {
    this.setState({months});
  };

  private setSaveStatus(workzoneId: string, saveStatus: ESaveStatus, error?: string): void {
    this.setState({
      workzones: this.state.workzones.map(workzone => {
        if (workzone.workzone.workzoneId !== workzoneId) return workzone;
        return {
          ...workzone,
          saveStatus,
          error: error === undefined ? workzone.error : error,
        };
      }),
    });
  }

  private loadNext = async (): Promise<void> => {
    const {
      store: {
        userAuth: {
          state: {
            user: {
              userId,
              companyId,
            },
          },
        },
      },
    } = this.props;
    const {
      isCanceled,
      months,
      workzones,
    } = this.state;
    const loadedWorkzones = await apiWorkzonesForOfflineUseGet({
      lastMonths: months,
      limit: LOAD_LIMIT,
      skip: (() => workzones.length)(),
    });
    if (localStorage.getItem('_debug_offlineMessages') === 'true') {
      console.log('DEBUG-OFFLINE: Prepare for offline: cims.concat(loadedWorkzones)', {
        current: workzones,
        new: workzones.concat(loadedWorkzones.map(workzone => ({
          workzone,
          saveStatus: ESaveStatus.DOWNLOADED,
          error: '',
        }))),
      });
    }
    this.setState(
      {
        workzones: workzones.concat(loadedWorkzones.map(workzone => ({
          workzone,
          saveStatus: ESaveStatus.DOWNLOADED,
          error: '',
        }))),
      },
      () => {
        if (!this.refWorkzonesList.current) return;
        this.refWorkzonesList.current.scrollTop = this.refWorkzonesList.current.firstElementChild.offsetHeight;
      },
    );

    await syncPromises(...loadedWorkzones.map(workzone => {
      return async () => {
        try {
          if (isCanceled) return;
          this.setSaveStatus(workzone.workzoneId, ESaveStatus.SAVING);
          await browserDbWorkzoneUpdate({
            companyId,
            userId,
            workzone,
            externalImport: true,
          });
          this.setSaveStatus(workzone.workzoneId, ESaveStatus.SAVED);
        }
        catch (e: any) {
          console.error('CIMsPrepareForOffline: Cannot save the CIM on device for offline use', {
            error: e,
            workzone,
          });
          this.setSaveStatus(workzone.workzoneId, ESaveStatus.SAVED, e.userMesssage || 'Cannot save on device');
        }
      };
    }));

    // Load recursively
    if (
      !isCanceled
      && loadedWorkzones.length === LOAD_LIMIT
    ) {
      return this.loadNext();
    }
  };

  private handleLoadClick = async (): Promise<void> => {
    try {
      const {
        userAuth: {
          state: {
            user: {
              userId,
              companyId,
            },
          },
        },
      } = this.props.store;
      this.setState({
        isLoading: true,
        isCanceled: false,
        loadError: null,
        workzones: [],
      });
      await new Promise(r => setTimeout(r, 0)); // Give time to the state to get updated
      await apiWorkzoneAppSettingsLoad(companyId, userId);      // Save offline the app's setting that have the ITIS codes
      await this.loadNext();
    }
    catch (e: any) {
      this.setState({loadError: e});
    }
    finally {
      this.setState({isLoading: false});
    }
  };

  private handleCancelClick = (): void => {
    this.setState({isCanceled: true});
  };

  public render(): JSX.Element {
    const {
      months,
      isLoading,
      isCanceled,
      loadError,
      workzones,
    } = this.state;

    return (
      <FlexContainerVertical
        fullHeight
        dataComponentName="WorkzonesPrepareForOffline"
      >
        <FlexItemMin>
          <GridContainer spacing={2}>
            <GridItem>
              <ErrorBanner error={loadError}/>
            </GridItem>
            <GridItem>
              <InputSlider
                label="Save for offline use CIMS created in last months"
                ariaLabel="Save for offline use CIMS created in last"
                getValueLabel={months => <span><strong>{months}</strong> months</span>}
                getAriaValueLabel={months => `${months} months`}
                disabled={isLoading}
                min={1}
                max={12}
                value={months}
                onChange={this.handleMonthsChange}
              />
            </GridItem>
            <GridItem>
              <ButtonBar>
                <Button
                  hidden={isLoading}
                  onClick={this.handleLoadClick}
                >
                  Save CIMs for offline use
                </Button>
                <Button
                  hidden={!isLoading}
                  color={EButtonColor.ERROR}
                  onClick={this.handleCancelClick}
                >
                  Cancel
                </Button>
              </ButtonBar>
            </GridItem>
            <GridItem>
              <Typography v="h3">
                Loaded CIMs
                <Box
                  show={!!workzones.length}
                  component="span"
                  children={" " + workzones.length}
                />
                <Box
                  show={isCanceled}
                  component="span"
                  sx={{color: theme => theme.palette.error.main}}
                  children={" Canceled"}
                />
                :
              </Typography>
            </GridItem>
          </GridContainer>
        </FlexItemMin>
        <FlexItemMax
          overFlowY
          fullHeight
          innerRef={this.refWorkzonesList}
        >
          <GridContainer spacing={3}>
            {workzones.length === 0 && '---'}
            <GridItem>
              {workzones.map((workzone, index) => (
                <div key={index}>
                  <Box
                    component="span"
                    sx={{
                      marginRight: theme => theme.spacing(1),
                      position: 'relative',
                      top: 3,
                    }}
                  >
                    {dynaSwitch<JSX.Element>(
                      workzone.saveStatus,
                      <UnknownStatusIcon/>,
                      {
                        [ESaveStatus.DOWNLOADED]: <DownloadedIcon/>,
                        [ESaveStatus.SAVING]: <SavingIcon/>,
                        [ESaveStatus.SAVED]: <SavedIcon/>,
                        [ESaveStatus.SAVE_FAILED]: <SaveFailed/>,
                      },
                    )}
                  </Box>
                  {workzone.workzone.name}
                  <Box
                    component="span"
                    sx={{
                      color: theme => theme.palette.error.main,
                      marginLeft: theme => theme.spacing(1),
                    }}
                  >
                    {workzone.error}
                  </Box>
                </div>
              ))}
              {isCanceled && (
                <Box
                  component="span"
                  sx={{color: theme => theme.palette.error.main}}
                >
                  {' '}Canceled
                </Box>
              )}
            </GridItem>
          </GridContainer>
        </FlexItemMax>
      </FlexContainerVertical>
    );
  }
}

export const WorkzonesPrepareForOffline = connect(WorkzonesPrepareForOffline_);
