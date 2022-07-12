import {
  useRef,
  useState,
  useEffect,
} from "react";

import {appConfig} from "../../../../../../../application/config/appConfig";

import {EWZBroadcastSelectionMode} from "mhc-server";
import {IUIWorkzone} from "../../../../IUIWorkzone";
import {EditCoordinateIcon} from "../../components/EditCoordinateIcon";

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
  ELeafletMarkerColor,
  IGeoMapLeafletMarker,
  IGeoMapLeafletPolyline,
  IGeoPosition,
  EMapType,
  IMapFullScreenEvent,
  MapButton,
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
import {Collapse} from "mhc-ui-components/dist/Collapse";

import {BroadcastAreaSelectionModeButton} from "./BroadcastAreaSelectionModeButton";

import {
  useTheme,
  SxProps,
} from "mhc-ui-components/dist/ThemeProvider";
import EditButtonIcon from "@mui/icons-material/Create";
import ClearIcon from "@mui/icons-material/DeleteOutline";
import OneBackIcon from "@mui/icons-material/Backspace";
import CoordinatesEditorIcon from "@mui/icons-material/ChromeReaderModeRounded";

export interface IWorkzoneFormBroadcastAreaSelectionByPolygonProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneFormBroadcastAreaSelectionByPolygon = (props: IWorkzoneFormBroadcastAreaSelectionByPolygonProps): JSX.Element => {
  const {
    useFormApi,
    useFormApi: {
      isLoading,
      viewMode,
      data: {
        point: referencePoint,
        path,
        broadcast,
        broadcast: {
          selectionMode,
          selectionByRegion: {region: {points: regionPoints}},
        },
      },
      validationResult: {dataValidation: validationErrors},
      change,
      addEventListener,
      removeEventListener,
    },
  } = props;
  const theme = useTheme();

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

  const handleFocus = (index: number) => setFocusedCoordinateIndex(index);

  const handleCoordinatesEditorToggle = () => setShowCoordinatesEditor(!showCoordinatesEditor);

  const handlePointsChange = (points: IGeoPosition[]): void => {
    change({
      broadcast: {
        ...broadcast,
        selectionByRegion: {
          ...broadcast.selectionByRegion,
          region: {
            ...broadcast.selectionByRegion.region,
            points,
          },
        },
      },
    });
  };

  const handleClearClick = (): void => {
    handlePointsChange([]);
  };

  const handleOneBackClick = (): void => {
    handlePointsChange(regionPoints.slice(0, -1));
  };

  const handleMapClick = (geoPosition: IGeoPosition): void => {
    if (viewMode === EViewMode.VIEW) return;

    const newRegionPoints = regionPoints.concat();

    if (newRegionPoints.length > 1) {
      const firstRegionPoint = newRegionPoints[0];
      const lastRegionPoint = newRegionPoints[newRegionPoints.length - 1];
      if (firstRegionPoint.lat === lastRegionPoint.lat && firstRegionPoint.lng === lastRegionPoint.lng) {
        newRegionPoints.pop();
      }
    }

    newRegionPoints.push(geoPosition);

    handlePointsChange(newRegionPoints);
  };

  const handleFullModeClick = ({
    preventDefault, refreshMap,
  }: IMapFullScreenEvent): void => {
    preventDefault();
    setFullScreen(!fullScreen);
    setTimeout(refreshMap, 10);
  };

  const inputEditor: JSX.Element | undefined = (() => {
    if (showCoordinatesEditor && viewMode === EViewMode.EDIT) {
      return (
        <InputCoordinates
          coordinates={regionPoints}
          multiCoordinates
          copyLastOnAdd
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
    markers.push({
      markerId: 'path-start',
      position: path.points[0],
      color: ELeafletMarkerColor.ORANGE,
      opacity: 0.25,
      popUp: {children: 'Start'},
    });
    if (path.points.length > 1) {
      markers.push({
        markerId: 'path-end',
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
  if (regionPoints.length) {
    regionPoints.forEach((point: IGeoPosition, index: number) => {
      if (focusedCoordinateIndex === index) {
        markers.push({
          markerId: 'edit-icon',
          position: point,
          customIcon: <EditCoordinateIcon />,
        });
        return;
      }
      if (index === 0) {
        markers.push({
          markerId: 'region-start',
          position: point,
          color: ELeafletMarkerColor.VIOLET,
          popUp: {children: 'Start'},
        });
      }
    });
  }
  polylines.push({
    polylineId: 'area',
    points: regionPoints,
    pathOptions: {
      color: 'red',
      weight: 8,
      fill: true,
      fillColor: 'red',
    },
  });

  // MHC-00409 RADIUS selection not currently supported, allowing access to old data but not allowing use of RADIUS selection.
  // ToDO remove when/if supported
  const allowAccessToSelection = selectionMode === EWZBroadcastSelectionMode.RADIUS;

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
          >
            {allowAccessToSelection &&
              <FlexItemMin>
                <BroadcastAreaSelectionModeButton useFormApi={useFormApi}/>
              </FlexItemMin>
            }
            <FlexItemMax>
              <Alert
                show={viewMode === EViewMode.VIEW && !regionPoints.length && !validationErrors['broadcast.selectionByRegion.region']}
                type={EAlertType.INFO}
                marginBottom={0}
                variant={EAlertVariant.OUTLINED}
                title="No area is defined."
              >
                Click the <EditButtonIcon sx={sxIcon}/> button and tap on the map.
              </Alert>
              <Alert
                show={viewMode === EViewMode.EDIT && !regionPoints.length && !validationErrors['broadcast.selectionByRegion.region']}
                type={EAlertType.INFO}
                marginBottom={0}
                variant={EAlertVariant.OUTLINED}
                title="Define the area."
              >
                Start tapping on the map.
              </Alert>
              <Alert
                type={EAlertType.ERROR}
                show={!!validationErrors['broadcast.selectionByRegion.region']}
                title="Input error"
              >
                {validationErrors['broadcast.selectionByRegion.region']}
              </Alert>
              <Collapse expanded={viewMode === EViewMode.EDIT && !!regionPoints.length}>
                <FlexContainerHorizontal>
                  <FlexItemMax>
                    <ButtonBar>
                      <Button
                        disabled={isLoading || !regionPoints.length}
                        color={EButtonColor.SECONDARY}
                        size={EButtonSize.LARGE}
                        icon={<ClearIcon/>}
                        onClick={handleClearClick}
                      >
                        Clear
                      </Button>
                    </ButtonBar>
                  </FlexItemMax>
                  <FlexItemMin>
                    <ButtonBar align={EButtonBarAlign.RIGHT}>
                      <Button
                        disabled={isLoading || !regionPoints.length}
                        color={EButtonColor.SECONDARY}
                        size={EButtonSize.LARGE}
                        icon={<OneBackIcon/>}
                        onClick={handleOneBackClick}
                      >
                        One back
                      </Button>
                    </ButtonBar>
                  </FlexItemMin>
                </FlexContainerHorizontal>
              </Collapse>
            </FlexItemMax>
          </FlexContainerHorizontal>
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
