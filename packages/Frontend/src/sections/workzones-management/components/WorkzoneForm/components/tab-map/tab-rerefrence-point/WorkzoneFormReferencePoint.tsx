import {
  useState,
  useRef,
  useEffect,
} from "react";
import {
  dynaError,
  IDynaError,
} from "dyna-error";
import {guid} from "dyna-guid";

import {EWZBroadcastSelectionMode} from "mhc-server";

import {IUIWorkzone} from "../../../IUIWorkzone";
import {appConfig} from "../../../../../../application/config/appConfig";
import {apiGeoPointElevationGet} from "../../../../../api/apiGeoPointElevationGet";
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
  IGeoMapLeafletRef,
  IGeoPosition,
  EMapType,
  IGeoMapLeafletCircle,
  ELeafletMarkerColor,
  IGeoMapLeafletMarker,
  IGeoMapLeafletPolyline,
  MapButton,
} from "mhc-ui-components/dist/GeoMapLeaflet";
import {
  Alert,
  EAlertType,
  EAlertVariant,
} from "mhc-ui-components/dist/Alert";
import {InputCoordinates} from "mhc-ui-components/dist/InputCoordinates";
import {ErrorBanner} from "mhc-ui-components/dist/ErrorBanner";

import {
  useTheme,
  SxProps,
} from "mhc-ui-components/dist/ThemeProvider";

import {convertLengthMetersToFeet} from "mhc-ui-components/dist/utils";
import {roundTo} from "../../../../../../../utils/roundTo";

import EditButtonIcon from "@mui/icons-material/Create";
import TipIcon from "@mui/icons-material/WbIncandescent";
import CoordinatesEditorIcon from "@mui/icons-material/ChromeReaderModeRounded";

export interface IWorkzoneFormReferencePointProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneFormReferencePoint = (props: IWorkzoneFormReferencePointProps): JSX.Element => {
  const {
    useFormApi,
    useFormApi: {
      viewMode,
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
  const theme = useTheme();


  const [showInfo, setShowInfo] = useState(true);
  const [showCoordinatesEditor, setShowCoordinatesEditor] = useState<boolean>(false);
  const [focusedCoordinateIndex, setFocusedCoordinateIndex] = useState<number>(-1);
  const [elevationError, setElevationError] = useState<IDynaError | undefined>(undefined);

  const refRequestId = useRef<string>("");
  const refMap = useRef<IGeoMapLeafletRef>(null);

  useEffect(() => {
    const handleFormLoad = () => refMap.current?.centerAllMarkers();
    const handleFormCancel = () => refRequestId.current = "";
    addEventListener('load', handleFormLoad);
    addEventListener('cancel', handleFormCancel);
    return () => {
      removeEventListener('load', handleFormLoad);
      removeEventListener('cancel', handleFormCancel);
    };
  }, [useFormApi]);

  const handleCloseInfo = (): void => setShowInfo(false);

  const handleMapClick = async (point: IGeoPosition | null) => {
    if (!point) return;
    change({point});
    const requestId = guid();
    try {
      refRequestId.current = requestId;
      if (elevationError) setElevationError(undefined);

      const pointsWithElevation: IGeoPosition[] = await apiGeoPointElevationGet([point]);

      if (refRequestId.current !== requestId) return;
      if (refRequestId.current === "") return;

      const pointWithElevation = pointsWithElevation[0];
      if (!pointWithElevation) {
        console.error(
          'Internal error, apiGeoPointElevationGet did not return anything',
          {response: pointsWithElevation},
        ); // 4TS
        return;
      }

      pointWithElevation.alt = convertLengthMetersToFeet(pointWithElevation.alt || 0);
      pointWithElevation.alt = roundTo(pointWithElevation.alt, 1);

      change({point: pointWithElevation});
    }
    catch (e: any) {
      if (refRequestId.current !== requestId) return;
      const error: IDynaError = {
        ...e,
        userMessage: `${e.userMessage || 'Elevation API unknown error, please set manually.'}`,
      };
      setElevationError(error);
    }
  };

  const handleChange = (updatedCoordinates: IGeoPosition[]) => change({point: updatedCoordinates[0]});
  const handleFocus = (index: number) => setFocusedCoordinateIndex(index);
  const handleCoordinatesEditorToggle = () => setShowCoordinatesEditor(!showCoordinatesEditor);

  const hasPoint = referencePoint.lat !== 0 && referencePoint.lng !== 0;
  const readOnly = viewMode === EViewMode.VIEW;

  const inputEditor: JSX.Element | undefined = (() => {
    if (showCoordinatesEditor && viewMode === EViewMode.EDIT) {
      return (
        <InputCoordinates
          coordinates={hasPoint ? [referencePoint] : [{
            lat: 1,
            lng: 1,
            alt: 1,
          }]}
          editAltitude
          onFocus={handleFocus}
          onChange={handleChange}
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
    if (focusedCoordinateIndex === 0) {
      markers.push({
        markerId: 'ref-point-a',
        position: referencePoint,
        customIcon: <EditCoordinateIcon/>,
        popUp: {children: 'Reference point'},
      });
    }
    else {
      markers.push({
        markerId: 'ref-point-b',  // Warning, should have different markerId!
        position: referencePoint,
        color: ELeafletMarkerColor.RED,
        popUp: {children: 'Reference point'},
      });
    }
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
  if (
    broadcast.selectionMode === EWZBroadcastSelectionMode.RADIUS
    && referencePoint.lng !== 0 && referencePoint.lat !== 0
    && broadcast.selectionByRadius.radiusInMeters > 0
  ) {
    circles.push({
      center: referencePoint,
      radiusInMeters: broadcast.selectionByRadius.radiusInMeters,
      opacity: 0.25,
      fillOpacity: 0.25,
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
        fillOpacity: 0.25,
      },
    });
  }

  const tip: React.ReactNode =
    <FlexContainerHorizontal alignVertical="middle">
      <FlexItemMin sx={{marginRight: theme.spacing(1)}}>
        <TipIcon/>
      </FlexItemMin>
      <FlexItemMax>
        The reference point is used to save the place of interest on the map but also acts as the center of selecting directional headings.
      </FlexItemMax>
    </FlexContainerHorizontal>;

  const sxEditIcon: SxProps = {
    width: 14,
    height: 14,
    position: 'relative',
    top: 2,
  };

  return (
    <FlexContainerVertical fullHeight>
      <FlexItemMin>
        <Alert
          show={viewMode === EViewMode.VIEW && !hasPoint && !validationErrors['point']}
          type={EAlertType.INFO}
          variant={EAlertVariant.OUTLINED}
          title="No reference point is defined."
        >
          Click the <EditButtonIcon sx={sxEditIcon}/> button and tap on the map.
          {tip}
        </Alert>
        <Alert
          show={showInfo && viewMode === EViewMode.EDIT && !validationErrors['point']}
          type={EAlertType.INFO}
          variant={EAlertVariant.OUTLINED}
          title={
            referencePoint.lat === 0
              ? 'Define the reference point.'
              : 'Re-define the reference point.'
          }
          closeButton
          onClose={handleCloseInfo}
        >
          Tap as many times as needed to refine the point.
          {tip}
        </Alert>
        <Alert
          type={EAlertType.ERROR}
          show={!!validationErrors['point']}
          title="Input error"
        >
          {validationErrors['point']}
        </Alert>
        <ErrorBanner
          error={
            elevationError
              ? dynaError({
                message: 'Cannot retrieve elevation',
                userMessage: "Error retrieving elevation for GeoPoint, please set the elevation manually using the input coordinates editor on the map.",
              })
              : undefined
          }
        />
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
          onClick={handleMapClick}
        />
      </FlexItemMax>
    </FlexContainerVertical>
  );
};
