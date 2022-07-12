import {
  useState,
  useEffect,
} from "react";

import {connect} from "react-dynadux";

import {Prompt} from 'react-router';

import {
  EWorkZonesManagementRights,
  IWorkzonesAppSettings,
  defaultWorkzoneAppSettings,
} from "mhc-server";

import {IAppStore} from "../../../../state/IAppStore";

import {
  IUIWorkzone,
  getDefaultUIWorkzone,
  convertIUIWorkzoneToIWorkzone,
  convertIWorkzoneToIUIWorkzone,
} from "./IUIWorkzone";

import {
  Alert,
  EAlertType,
} from "mhc-ui-components/dist/Alert";
import {
  FlexContainerVertical,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";
import {Box} from "mhc-ui-components/dist/Box";
import {IsLoading} from "mhc-ui-components/dist/IsLoading";
import {ErrorBanner} from "mhc-ui-components/dist/ErrorBanner";
import {
  Tabs,
  ETabVariant,
  ETabLabelSize,
  ETabIconPosition,
} from "mhc-ui-components/dist/Tabs";
import {useLoadData} from "mhc-ui-components/dist/useLoadData";
import {
  useForm,
  EFormType,
} from "mhc-ui-components/dist/useForm";

import {routeWorkZonesList} from "../../routes/routeWorkZonesList";
import {routeWorkZonesEditPaths} from "../../routes/routeWorkzoneEdit.paths";

import {OfflineInfo} from "../OfflineInfo/OfflineInfo";
import {NotFound404Page} from "../../../application/pages/NotFound404Page";
import {WorkzoneToolbar} from "./components/WorkzoneToolbar/WorkzoneToolbar";
import {WorkzoneFormGeneral} from "./components/tab-general/WorkzoneFormGeneral";
import {WorkzoneFormMapView} from "./components/tab-map/tab-view/WorkzoneFormMapView";
import {WorkzoneFormReferencePoint} from "./components/tab-map/tab-rerefrence-point/WorkzoneFormReferencePoint";
import {WorkzoneFormPathSelection} from "./components/tab-map/tab-path/WorkzoneFormPathSelection";
import {WorkzoneFormHeading} from "./components/tab-map/tab-heading/WorkzoneFormHeading";
import {WorkzoneFormBroadcastAreaSelection} from "./components/tab-map/tab-broadcast/WorkzoneFormBroadcastAreaSelection";
import {WorkzoneFormBroadcastAction} from "./components/tab-broadcast/WorkzoneFormBroadcastAction";
import {WorkzoneNotes} from "./components/tab-notes/WorkzoneNotes";

import {
  IOfflineInfo,
  EOfflineStatus,
} from "../../api/interfaces";
import {apiWorkzoneAppSettingsLoad} from "../../api/apiWorkzoneAppSettingsLoad";
import {apiWorkzoneItemPost} from "../../api/apiWorkzoneItemPost";
import {apiWorkzoneItemGet} from "../../api/apiWorkzoneItemGet";
import {apiWorkzoneItemPut} from "../../api/apiWorkzoneItemPut";
import {apiWorkzoneItemDelete} from "../../api/apiWorkzoneItemDelete";
import {apiWorkzoneItemUndelete} from "../../api/apiWorkzoneItemUndelete";

import {getValidationErrorByProps} from "./utils/getValidationErrorByProps";

import GeneralIcon from '@mui/icons-material/LineWeight';
import PointIcon from '@mui/icons-material/Room';
import ExploreIcon from '@mui/icons-material/Explore';
import PathIcon from '@mui/icons-material/AddLocation';
import MapIcon from '@mui/icons-material/Map';
import MapViewIcon from '@mui/icons-material/Map';
import BroadcastSelection from '@mui/icons-material/ZoomOutMap';
import BroadcastAction from '@mui/icons-material/RssFeed';
import NotesIcon from '@mui/icons-material/Note';

export interface IWorkzoneFormProps {
  store: IAppStore;
  workzoneId?: string;
  allowBroadcast: boolean;
  tabLevel1?: string;
  tabLevel2?: string;
}

export const WorkzoneForm = connect((props: IWorkzoneFormProps): JSX.Element | null => {
  const {
    store: {
      app: {
        state: {online},
        actions: {
          disableThemeChange,
          navigateTo,
        },
      },
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
    workzoneId,
    allowBroadcast,
    tabLevel1 = 'general',
    tabLevel2 = null,
  } = props;

  const userCanModify = userHasAllRights([EWorkZonesManagementRights.WORKZONES_EDIT]);

  const {
    data: workzoneAppSettings,
    error: workzoneAppSettingLoadError,
    reload: reloadworkzoneAppSettings,
  } = useLoadData<IWorkzonesAppSettings>({
    defaultData: {...defaultWorkzoneAppSettings},
    timeout: 20000,
    errorHandling: {
      consoleMessage: 'Cannot load itisCodes',
      userMessage: 'Error initializing\nCannot load ITIS codes',
    },
    onLoad: async () => {
      const response = await apiWorkzoneAppSettingsLoad(companyId, userId);
      return response.data;
    },
  });

  const {
    useFormApi,
    isNew,
    isChanged,
    isLoading,
    alert,
    loadFatalError,
    validationResult: {dataValidation: validationErrors},
    data: {workzoneId: dataId},
    formProps,
  } = useForm<IUIWorkzone, string>({
    formType: EFormType.VIEW_EDIT,
    loadDataId: workzoneId || null,
    emptyFormData: {
      ...getDefaultUIWorkzone(),
      closureSelectionMode: workzoneAppSettings.closureSelectionMode,
    },
    userCanEdit: userCanModify,
    userCanDelete: userCanModify,
    userCanUnDelete: userCanModify,

    disabledEditOnDeleted: true,

    onApiPost: async (workzone) => {
      const response = await apiWorkzoneItemPost(companyId, userId, convertIUIWorkzoneToIWorkzone(workzone));
      setOfflineInfo(response.offlineInfo);
      if (!online) refreshOfflineItemsCounter();
      const uiWorkzone = convertIWorkzoneToIUIWorkzone(response.data);
      navigateTo({
        url: routeWorkZonesEditPaths.routePath
          .replace(':workzoneId', uiWorkzone.workzoneId),
        replace: true,
      });
      return {
        dataId: uiWorkzone.workzoneId,
        data: uiWorkzone,
      };
    },
    onApiGet: async (workzoneId) => {
      const result = await apiWorkzoneItemGet(companyId, userId, workzoneId);
      setOfflineInfo(result.offlineInfo);
      if (!online) refreshOfflineItemsCounter();
      return convertIWorkzoneToIUIWorkzone(result.data);
    },
    onApiPut: async (workzone) => {
      const result = await apiWorkzoneItemPut(companyId, userId, convertIUIWorkzoneToIWorkzone(workzone));
      setOfflineInfo(result.offlineInfo);
      if (!online) refreshOfflineItemsCounter();
      return convertIWorkzoneToIUIWorkzone(result.data);
    },
    onApiDelete: async (workzoneId) => {
      const result = await apiWorkzoneItemDelete(companyId, userId, workzoneId);
      if (!online) refreshOfflineItemsCounter();
      setOfflineInfo(result.offlineInfo);
      return convertIWorkzoneToIUIWorkzone(result.data);
    },
    onApiUndelete: async (workzoneId) => {
      const result = await apiWorkzoneItemUndelete(companyId, userId, workzoneId);
      if (!online) refreshOfflineItemsCounter();
      setOfflineInfo(result.offlineInfo);
      return convertIWorkzoneToIUIWorkzone(result.data);
    },

    onBeforeFormSave: (workzone) => {
      setOfflineInfo({
        status: EOfflineStatus.ACTUAL_VERSION,
        userMessage: '',
      });

      // Close the broadcast region is not closed
      const broadcastRegion = workzone.broadcast.selectionByRegion.region;
      if (
        broadcastRegion.points.length > 2
        && broadcastRegion.points[0].lat !== broadcastRegion.points[broadcastRegion.points.length - 1].lat
        && broadcastRegion.points[0].lng !== broadcastRegion.points[broadcastRegion.points.length - 1].lng
      ) {
        broadcastRegion.points = broadcastRegion.points.concat({...broadcastRegion.points[0]});
      }
      return workzone;
    },
    onFormSave: () => {
      reloadworkzoneAppSettings();
    },
    onFormCancel: () => {
      if (isNew) navigateTo({url: routeWorkZonesList.routePath});
    },
  });

  const [tabId, setTabId] = useState(tabLevel1);
  const [mapTabId, setMapTabId] = useState(tabLevel2 || 'view');
  const [offlineInfo, setOfflineInfo] = useState<IOfflineInfo>({
    status: EOfflineStatus.ACTUAL_VERSION,
    userMessage: '',
  });

  useEffect(() => {
    setTabId(tabLevel1);
    setMapTabId(tabLevel2 || 'view');
  }, [tabLevel1, tabLevel2]);

  useEffect(() => {
    disableThemeChange(tabId === 'map');
    return () => disableThemeChange(false);
  }, [tabId]);

  const handleGoToReferenceTab = (): void => setMapTabId('point');

  if (workzoneAppSettingLoadError) return <ErrorBanner error={workzoneAppSettingLoadError}/>;
  if (loadFatalError) return <ErrorBanner error={loadFatalError}/>;

  const tabGeneralValidationError = getValidationErrorByProps(
    validationErrors,
    [
      'name',
      'active',
      'itisCodes',
      'start',
      'end',
      'closedLane',
      'closureType',
      'closedShoulder',
      'closedLaneWidthInFeet',
      'workersPresent',
    ],
  );

  const tabMapsValidationError = getValidationErrorByProps(
    validationErrors,
    [
      'point',
      'path',
      'broadcast.selectionByRegion.region',
      'broadcast.selectionByRadius.radiusInMeters',
    ],
  );

  const tabReferencePointValidationError = getValidationErrorByProps(
    validationErrors,
    [
      'point',
    ],
  );

  const tabPathPointValidationError = getValidationErrorByProps(
    validationErrors,
    [
      'path',
    ],
  );

  const tabHeadingValidationError = getValidationErrorByProps(
    validationErrors,
    [
      'heading',
    ],
  );

  const tabBroadcastAreaSelectionValidationError = getValidationErrorByProps(
    validationErrors,
    [
      'broadcast.selectionByRegion.region',
      'broadcast.selectionByRadius.radiusInMeters',
    ],
  );

  const handleTabLevel1Navigation = (id: string) => {
    setTabId(id);
    if (!isNew) {
      if (id !== 'map') {
        navigateTo({
          url: routeWorkZonesEditPaths.routePath
            .replace(':workzoneId', dataId!)
            .replace(':tabLevel1?', id),
        });
      }
      else {
        navigateTo({
          url: routeWorkZonesEditPaths.routePath
            .replace(':workzoneId', dataId!)
            .replace(':tabLevel1?', id)
            .replace(':tabLevel2?', 'view'),
        });
      }
    }
  };

  const handleTabLevel2Navigation = (id: string) => {
    setMapTabId(id);
    if (!isNew) {
      navigateTo({
        url:
          routeWorkZonesEditPaths.routePath
            .replace(':workzoneId', dataId!)
            .replace(':tabLevel1?', tabId)
            .replace(':tabLevel2?', id),
      });
    }
  };

  if (!['general', 'map', 'broadcast-action', 'notes'].includes(tabLevel1)) {
    return <NotFound404Page info="CIM form: Unknown Main tab"/>;
  }
  if (tabLevel1 === 'map' && tabLevel2 && !['view', 'point', 'path', 'heading', 'broadcast-area-selection'].includes(tabLevel2)) {
    return <NotFound404Page info="CIM form: Unknown Map tab"/>;
  }

  return (
    <Box
      dataComponentName="CIMInternalForm"
      fullHeight
      sx={{
        maxWidth: 900,
        margin: 'auto',
      }}
    >
      <Prompt
        when={isChanged}
        message={(location) => {
          const promptMessage = "You have unsaved changes, are you sure you want to leave?";
          // When Editing, skip when there is a change but user is navigating within the CIM form (deep links)
          if (workzoneId) {
            return location.pathname.startsWith(routeWorkZonesEditPaths.getRoutePath({workzoneId}))
              ? true
              : promptMessage;
          }
          else {
            return promptMessage;
          }
        }}
      />
      <form
        style={{height: '100%'}}
        {...formProps}
      >
        <FlexContainerVertical fullHeight>
          <FlexItemMin>
            <WorkzoneToolbar
              workzoneAppSettings={workzoneAppSettings}
              useFormApi={useFormApi}
            />
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

          <FlexItemMax fullHeight>
            <IsLoading
              fullHeight
              isLoading={isLoading}
            >
              <Tabs
                ariaLabel="CIM main tabs"
                variant={ETabVariant.FULL_WIDTH}
                labelSize={ETabLabelSize.MEDIUM}
                iconPosition={ETabIconPosition.LEFT}
                hideLabelsOnMobile
                hideLabelsOnTablet
                fullHeight
                tabId={tabId}
                onChange={handleTabLevel1Navigation}
                tabs={[
                  {
                    tabId: 'general',
                    label: 'General',
                    ariaLabel: 'General',
                    icon: <GeneralIcon/>,
                    validationError: tabGeneralValidationError,
                    content:
                      <WorkzoneFormGeneral
                        workzoneAppSettings={workzoneAppSettings}
                        useFormApi={useFormApi}
                      />,
                  },
                  {
                    tabId: 'map',
                    label: 'Map',
                    ariaLabel: 'Map',
                    icon: <MapIcon/>,
                    validationError: tabMapsValidationError,
                    content:
                      <Tabs
                        ariaLabel="CIMs map tabs"
                        variant={ETabVariant.FULL_WIDTH}
                        labelSize={ETabLabelSize.SMALL}
                        iconPosition={ETabIconPosition.TOP}
                        hideLabelsOnMobile
                        hideLabelsOnTablet
                        fullHeight
                        tabId={mapTabId}
                        onChange={handleTabLevel2Navigation}
                        tabs={[
                          {
                            tabId: 'view',
                            label: 'View',
                            ariaLabel: 'View',
                            icon: <MapViewIcon/>,
                            content: <WorkzoneFormMapView useFormApi={useFormApi}/>,
                          },
                          {
                            tabId: 'point',
                            label: 'Reference Point',
                            ariaLabel: 'Reference Point',
                            icon: <PointIcon/>,
                            validationError: tabReferencePointValidationError,
                            content:
                              <WorkzoneFormReferencePoint useFormApi={useFormApi}/>,
                          },
                          {
                            tabId: 'path',
                            label: 'Path',
                            ariaLabel: 'Path',
                            icon: <PathIcon/>,
                            validationError: tabPathPointValidationError,
                            content: <WorkzoneFormPathSelection useFormApi={useFormApi}/>,
                          },
                          {
                            tabId: 'heading',
                            label: 'Heading',
                            ariaLabel: 'Heading',
                            icon: <ExploreIcon/>,
                            validationError: tabHeadingValidationError,
                            content:
                              <WorkzoneFormHeading useFormApi={useFormApi}/>,
                          },
                          {
                            tabId: 'broadcast-area-selection',
                            label: 'Broadcast area',
                            ariaLabel: 'Broadcast area',
                            icon: <BroadcastSelection/>,
                            validationError: tabBroadcastAreaSelectionValidationError,
                            content: (
                              <WorkzoneFormBroadcastAreaSelection
                                useFormApi={useFormApi}
                                onGoToReferencePointTab={handleGoToReferenceTab}
                              />
                            ),
                          },
                        ]}
                      />,
                  },
                  {
                    tabId: 'broadcast-action',
                    label: 'Broadcast',
                    ariaLabel: 'Broadcast',
                    icon: <BroadcastAction/>,
                    content:
                      <WorkzoneFormBroadcastAction
                        useFormApi={useFormApi}
                        allowBroadcast={allowBroadcast}
                      />,
                  },
                  {
                    tabId: 'notes',
                    label: 'Notes',
                    ariaLabel: 'Notes',
                    icon: <NotesIcon/>,
                    content: <WorkzoneNotes useFormApi={useFormApi}/>,
                  },
                ]}
              />
            </IsLoading>
          </FlexItemMax>
        </FlexContainerVertical>
      </form>
    </Box>
  );
});
