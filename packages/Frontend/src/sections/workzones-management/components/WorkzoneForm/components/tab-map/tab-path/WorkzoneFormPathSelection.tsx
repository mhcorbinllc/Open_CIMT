import {
  useState,
  useRef,
  useEffect,
} from "react";

import {EWZBroadcastSelectionMode} from "mhc-server";

import {Collapse} from "mhc-ui-components/dist/Collapse";

import {IUIWorkzone} from "../../../IUIWorkzone";
import {appConfig} from "../../../../../../application/config/appConfig";
import {EditCoordinateIcon} from "../components/EditCoordinateIcon";

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
  IGeoPosition,
  EMapType,
  IMapFullScreenEvent,
  ELeafletMarkerColor,
  IGeoMapLeafletMarker,
  IGeoMapLeafletPolyline,
  IGeoMapLeafletCircle,
  MapButton,
  IGeoMapLeafletRef,
} from "mhc-ui-components/dist/GeoMapLeaflet";
import {
  Alert,
  EAlertType,
  EAlertVariant,
} from "mhc-ui-components/dist/Alert";
import {
  Button,
  EButtonColor,
  EButtonSize,
} from "mhc-ui-components/dist/Button";
import {
  ButtonBar,
  EButtonBarAlign,
} from "mhc-ui-components/dist/ButtonBar";
import {FullScreenContainer} from "mhc-ui-components/dist/FullScreenContainer";
import {InputCoordinates} from "mhc-ui-components/dist/InputCoordinates";
import {BreakpointDeviceContainer} from "mhc-ui-components/dist/BreakpointDeviceContainer";
import {
  CircularProgress,
  ECircularProgressSize,
  ECircularProgressColor,
} from "mhc-ui-components/dist/CircularProgress";

import {SxProps} from "mhc-ui-components/dist/ThemeProvider";
import ClearIcon from "@mui/icons-material/DeleteOutline";
import OneBackIcon from "@mui/icons-material/Backspace";
import EditButtonIcon from "@mui/icons-material/Create";
import CoordinatesEditorIcon from "@mui/icons-material/ChromeReaderModeRounded";

export interface IWorkzoneFormPathSelectionProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneFormPathSelection = (props: IWorkzoneFormPathSelectionProps): JSX.Element => {
  const {
    useFormApi,
    useFormApi: {
      viewMode,
      isLoading,
      data: {
        point: referencePoint,
        path,
        broadcast,
      },
      change,
      validationResult: {dataValidation: validationErrors},
      addEventListener,
      removeEventListener,
    },
  } = props;

  const refMap = useRef<IGeoMapLeafletRef>(null);

  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [showCoordinatesEditor, setShowCoordinatesEditor] = useState<boolean>(false);
  const [focusedCoordinateIndex, setFocusedCoordinateIndex] = useState<number>(-1);

  useEffect(() => {
    const handleFormLoad = () => refMap.current?.centerAllMarkers();
    addEventListener('load', handleFormLoad);
    return () => {
      removeEventListener('load', handleFormLoad);
    };
  }, [useFormApi]);

  const readOnly = viewMode === EViewMode.VIEW;
  const hasMaximumPathLength = path.points.length === 63;

  const handleFocus = (index: number) => setFocusedCoordinateIndex(index);

  const handleCoordinatesEditorToggle = () => setShowCoordinatesEditor(!showCoordinatesEditor);

  const handlePointsChange = (points: IGeoPosition[]): void => {
    change({
      path: {
        ...path,
        points,
      },
    });
  };

  const handleClearClick = (): void => {
    handlePointsChange([]);
  };

  const handleOneBackClick = (): void => {
    handlePointsChange(path.points.slice(0, -1));
  };

  const handleFullModeClick = (
    {
      preventDefault,
      refreshMap,
    }: IMapFullScreenEvent,
  ): void => {
    preventDefault();
    setFullScreen(!fullScreen);
    setTimeout(refreshMap, 10);
  };

  const handleMapClick = (geoPosition: IGeoPosition): void => {
    if (viewMode === EViewMode.VIEW) return;
    if (hasMaximumPathLength) return;
    handlePointsChange(path.points.concat(geoPosition));
  };

  const inputEditor: JSX.Element | undefined = (() => {
    if (showCoordinatesEditor && viewMode === EViewMode.EDIT) {
      return (
        <InputCoordinates
          coordinates={path.points}
          multiCoordinates
          copyLastOnAdd
          disableAdd={hasMaximumPathLength}
          onFocus={handleFocus}
          onChange={handlePointsChange}
          onClose={handleCoordinatesEditorToggle}
        />
      );
    }
    return undefined;
  })();

  const inputEditorButton: JSX.Element = (() => {
    return (
      <MapButton
        title="Coordinates editor"
        icon={<CoordinatesEditorIcon/>}
        disabled={readOnly}
        onClick={handleCoordinatesEditorToggle}
      />
    );
  })();

  const markers: IGeoMapLeafletMarker[] = [];
  const polylines: IGeoMapLeafletPolyline[] = [];
  const circles: IGeoMapLeafletCircle[] = [];

  // Reference point
  if (referencePoint.lng !== 0 && referencePoint.lat !== 0) {
    markers.push({
      markerId: 'ref-point',
      position: referencePoint,
      color: ELeafletMarkerColor.RED,
      opacity: 0.25,
      popUp: {children: 'Reference point'},
    });
  }

  // Path
  if (path.points.length) {
    path.points.forEach((point: IGeoPosition, index: number) => {
      if (focusedCoordinateIndex === index) {
        markers.push({
          markerId: 'focused',
          position: point,
          customIcon: <EditCoordinateIcon />,
        });
        return;
      }
      if (index === 0) {
        markers.push({
          markerId: 'start',
          position: point,
          color: ELeafletMarkerColor.ORANGE,
          popUp: {children: 'Start'},
        });
      }

      if (index === path.points.length - 1 && viewMode === EViewMode.VIEW) {
        markers.push({
          markerId: 'end',
          position: point,
          color: ELeafletMarkerColor.GREEN,
          popUp: {children: 'End'},
        });
      }
    });
  }

  polylines.push({
    polylineId: 'main-path',
    points: path.points,
    pathOptions: {
      color: 'blue',
      weight: 8,
    },
  });

  // Broadcast area selection
  if (
    broadcast.selectionMode === EWZBroadcastSelectionMode.RADIUS
    && referencePoint.lng !== 0 && referencePoint.lat !== 0
    && broadcast.selectionByRadius.radiusInMeters > 0
  ) {
    circles.push({
      center: referencePoint,
      opacity: 0.25,
      fillOpacity: 0.25,
      radiusInMeters: broadcast.selectionByRadius.radiusInMeters,
    });
  }
  if (
    broadcast.selectionMode === EWZBroadcastSelectionMode.REGION
    && broadcast.selectionByRegion.region.points.length
  ) {
    polylines.push({
      polylineId: 'area',
      points: broadcast.selectionByRegion.region.points,
      pathOptions: {
        color: 'red',
        opacity: 0.25,
        weight: 8,
        fill: true,
        fillColor: 'red',
      },
    });
  }

  const sxEditorIcon: SxProps = {
    width: 14,
    height: 14,
    position: 'relative',
    top: 2,
  };

  return (
    <FullScreenContainer
      fullScreen={fullScreen}
      fullHeight
      dataComponentName="WorkzoneFormPathSelection"
    >
      <FlexContainerVertical fullHeight>
        <FlexItemMin>
          <Alert
            show={viewMode === EViewMode.VIEW && !path.points.length && !validationErrors['path']}
            type={EAlertType.INFO}
            variant={EAlertVariant.OUTLINED}
            title="No path is defined."
            marginBottom={2}
          >
            Click the <EditButtonIcon sx={sxEditorIcon}/> button and tap on the map.
          </Alert>
          <Alert
            show={viewMode === EViewMode.EDIT && !path.points.length && !validationErrors['path']}
            type={EAlertType.INFO}
            variant={EAlertVariant.OUTLINED}
            title="Define the path."
            marginBottom={2}
          >
            Start tapping on the map.
          </Alert>
          <Alert
            type={EAlertType.INFO}
            show={viewMode === EViewMode.EDIT && !!hasMaximumPathLength}
            title="Maximum number of path points selected"
            marginBottom={2}
          >
            You may remove path points by clicking the "One Back" button or using the input coordinate editor on the map.
          </Alert>
          <Alert
            type={EAlertType.ERROR}
            show={!!validationErrors['path']}
            title="Input error"
            marginBottom={2}
          >
            {validationErrors['path']}
          </Alert>
          <Collapse expanded={viewMode === EViewMode.EDIT && !!path.points.length}>
            <FlexContainerHorizontal alignHorizontalSpaceBetween>
              <ButtonBar>
                <Button
                  disabled={isLoading || !path.points.length}
                  color={EButtonColor.SECONDARY}
                  size={EButtonSize.LARGE}
                  icon={<ClearIcon/>}
                  onClick={handleClearClick}
                >
                  Clear
                </Button>
              </ButtonBar>
              <BreakpointDeviceContainer allExcept mobile>
                <CircularProgress
                  color={
                    path.points.length !== 63
                      ? ECircularProgressColor.PRIMARY
                      : ECircularProgressColor.SECONDARY
                  }
                  size={ECircularProgressSize.LARGE}
                  thickness={4}
                  label={`${path.points.length}/63`}
                  value={(path.points.length / 63) * 100}
                />
              </BreakpointDeviceContainer>
              <ButtonBar align={EButtonBarAlign.RIGHT}>
                <Button
                  disabled={isLoading || !path.points.length}
                  color={EButtonColor.SECONDARY}
                  size={EButtonSize.LARGE}
                  icon={<OneBackIcon/>}
                  onClick={handleOneBackClick}
                >
                  One back
                </Button>
              </ButtonBar>
            </FlexContainerHorizontal>
          </Collapse>
        </FlexItemMin>
        <FlexItemMax>
          <GeoMapLeaflet
            id="CIMTAppMapID"
            ref={refMap}
            delayStart={1000}
            gestureZoom
            readOnly={readOnly}
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
            rightToolbar={inputEditorButton}
            mapOverlay={inputEditor}
            onFullScreenClick={handleFullModeClick}
            onClick={handleMapClick}
          />
        </FlexItemMax>
      </FlexContainerVertical>
    </FullScreenContainer>
  );
};
