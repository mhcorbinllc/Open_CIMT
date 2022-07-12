import {
  useState,
  useRef,
  useEffect,
} from "react";

import {IUIWorkzone} from "../../../../IUIWorkzone";
import {appConfig} from "../../../../../../../application/config/appConfig";

import {
  FlexContainerVertical,
  FlexContainerHorizontal,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";
import {
  IUseFormApi,
  EViewMode,
} from "mhc-ui-components/dist/useForm";
import {
  GeoMapLeaflet,
  IGeoMapLeafletRef,
  IGeoPosition,
  EMapType,
  IMapFullScreenEvent,
  IGeoMapLeafletMarker,
  IGeoMapLeafletPolyline,
  IGeoMapLeafletCircle,
  ELeafletMarkerColor,
  getDistanceInMeters,
} from "mhc-ui-components/dist/GeoMapLeaflet";
import {FullScreenContainer} from "mhc-ui-components/dist/FullScreenContainer";
import {BreakpointDeviceContainer} from "mhc-ui-components/dist/BreakpointDeviceContainer";
import {
  Alert,
  EAlertType,
  EAlertVariant,
} from "mhc-ui-components/dist/Alert";
import {
  Button,
  EButtonColor,
} from "mhc-ui-components/dist/Button";

import {BroadcastAreaSelectionModeButton} from "./BroadcastAreaSelectionModeButton";

import {
  useTheme,
  SxProps,
} from "mhc-ui-components/dist/ThemeProvider";
import EditButtonIcon from "@mui/icons-material/Create";
import PointIcon from "@mui/icons-material/Room";

export interface IWorkzoneFormBroadcastAreaSelectionByRadiusProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
  onGoToReferencePointTab: () => void;
}

export const WorkzoneFormBroadcastAreaSelectionByRadius = (props: IWorkzoneFormBroadcastAreaSelectionByRadiusProps): JSX.Element => {
  const {
    useFormApi,
    useFormApi: {
      viewMode,
      data: {
        point: referencePoint,
        path,
        broadcast,
        broadcast: {selectionByRadius: {radiusInMeters}},
      },
      validationResult: {dataValidation: validationErrors},
      change,
      addEventListener,
      removeEventListener,
    },
    onGoToReferencePointTab,
  } = props;
  const theme = useTheme();

  const refMap = useRef<IGeoMapLeafletRef>(null);

  const [fullScreen, setFullScreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFormLoad = () => refMap.current?.centerAllMarkers();
    addEventListener('load', handleFormLoad);
    return () => {
      removeEventListener('load', handleFormLoad);
    };
  }, [useFormApi]);

  const handleMapClick = (geoPosition: IGeoPosition): void => {
    if (viewMode === EViewMode.VIEW) return;
    change({
      broadcast: {
        ...broadcast,
        selectionByRadius: {
          ...broadcast.selectionByRadius,
          radiusInMeters: getDistanceInMeters(referencePoint, geoPosition),
        },
      },
    });
  };

  const handleFullModeClick = ({
    preventDefault, refreshMap,
  }: IMapFullScreenEvent): void => {
    preventDefault();
    setFullScreen(!fullScreen);
    setTimeout(refreshMap, 10);
  };

  const hasSelectedReferencePoint: boolean = referencePoint.lat !== 0 && referencePoint.lng !== 0;

  const markers: IGeoMapLeafletMarker[] = [];
  const polylines: IGeoMapLeafletPolyline[] = [];
  const circles: IGeoMapLeafletCircle[] = [];

  // Reference point
  if (referencePoint.lng !== 0 && referencePoint.lat !== 0) {
    markers.push({
      markerId: 'ref-point',
      position: referencePoint,
      color: ELeafletMarkerColor.RED,
      popUp: {children: 'Reference point'},
    });
  }

  // Path
  if (path.points.length) {
    markers.push({
      markerId: 'start',
      position: path.points[0],
      color: ELeafletMarkerColor.ORANGE,
      opacity: 0.25,
      popUp: {children: 'Start'},
    });
    if (path.points.length > 1) {
      markers.push({
        markerId: 'end',
        position: path.points[path.points.length - 1],
        color: ELeafletMarkerColor.GREEN,
        opacity: 0.25,
        popUp: {children: 'End'},
      });
    }
    polylines.push({
      polylineId: 'main-path',
      points: path.points,
      pathOptions: {
        color: 'blue',
        opacity: 0.25,
        weight: 8,
      },
    });
  }

  // Broadcast area selection
  if (hasSelectedReferencePoint) {
    circles.push({
      radiusInMeters,
      center: referencePoint,
    });
  }

  const sxIcon: SxProps = {
    width: 14,
    height: 14,
    position: 'relative',
    top: 2,
  };

  return (
    <FullScreenContainer fullScreen={fullScreen} fullHeight>
      <FlexContainerVertical fullHeight>

        <FlexItemMin>
          <FlexContainerHorizontal
            sx={{
              paddingBottom: theme.spacing(1),
              backgroundColor: theme.palette.background.default,
              '& > *:not(:last-child)': {marginRight: 8},
            }}
            alignVertical="middle"
            fullHeight
          >
            <FlexItemMin>
              <BroadcastAreaSelectionModeButton useFormApi={useFormApi}/>
            </FlexItemMin>
            <FlexItemMin
              sx={{
                fontSize: theme.typography.fontSize,
                whiteSpace: 'nowrap',
              }}
            >
              {hasSelectedReferencePoint && (<>
                <strong>Radius</strong><br/>
                {Math.round(radiusInMeters * 10) / 10} meters
              </>)}
            </FlexItemMin>
            <FlexItemMax>
              <BreakpointDeviceContainer allExcept mobile>
                <Alert
                  show={viewMode === EViewMode.VIEW && hasSelectedReferencePoint && !radiusInMeters && !validationErrors['broadcast.selectionByRadius.radiusInMeters']}
                  type={EAlertType.INFO}
                  marginBottom={0}
                  variant={EAlertVariant.OUTLINED}
                  title="No selection."
                >
                  Click the <EditButtonIcon sx={sxIcon}/> button and tap on the map.
                </Alert>
                <Alert
                  show={viewMode === EViewMode.EDIT && hasSelectedReferencePoint && !validationErrors['broadcast.selectionByRadius.radiusInMeters']}
                  type={EAlertType.INFO}
                  marginBottom={0}
                  variant={EAlertVariant.OUTLINED}
                  title="Define radius"
                >
                  Tap as many times as needed to refine the radius.
                </Alert>
                <Alert
                  type={EAlertType.ERROR}
                  show={!!validationErrors['broadcast.selectionByRadius.radiusInMeters']}
                  title="Input error"
                >
                  {validationErrors['broadcast.selectionByRadius.radiusInMeters']}
                </Alert>
              </BreakpointDeviceContainer>
            </FlexItemMax>
          </FlexContainerHorizontal>
        </FlexItemMin>

        <FlexItemMax>
          {hasSelectedReferencePoint && (
            <GeoMapLeaflet
              id="CIMTAppMapID"
              ref={refMap}
              delayStart={1000}
              gestureZoom
              fullScreenButton
              centerMarkersButton={markers && markers.length > 0}
              googleMapApiKey={appConfig.googleMapsApiKey}
              availableMapTypes={[
                EMapType.ROADMAP,
                EMapType.SATELLITE,
                EMapType.TERRAIN,
                EMapType.HYBRID,
              ]}
              markers={markers}
              polylines={polylines}
              circles={circles}
              onFullScreenClick={handleFullModeClick}
              onClick={handleMapClick}
            />
          )}
          {!hasSelectedReferencePoint && (
            <FlexContainerVertical alignHorizontal="center" alignVertical="middle" fullHeight>
              <Alert
                sx={{maxWidth: '80%'}}
                type={EAlertType.ERROR}
                variant={EAlertVariant.OUTLINED}
                title="No reference point is defined."
              >
                Selection by radius requires the Reference Point to be defined first.
                <br/>
                <Button
                  color={EButtonColor.SECONDARY}
                  icon={<PointIcon/>}
                  onClick={onGoToReferencePointTab}
                >
                  Go to Reference Point tab
                </Button>
              </Alert>
            </FlexContainerVertical>
          )}
        </FlexItemMax>
      </FlexContainerVertical>
    </FullScreenContainer>
  );
};
