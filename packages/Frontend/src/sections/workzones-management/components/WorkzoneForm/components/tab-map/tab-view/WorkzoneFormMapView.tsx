import {
  useRef,
  useEffect,
} from "react";

import {EWZBroadcastSelectionMode} from "mhc-server";

import {IUIWorkzone} from "../../../IUIWorkzone";
import {appConfig} from "../../../../../../application/config/appConfig";

import {
  FlexContainerVertical,
} from "mhc-ui-components/dist/FlexContainer";
import {IUseFormApi} from "mhc-ui-components/dist/useForm";
import {
  GeoMapLeaflet,
  EMapType,
  IGeoMapLeafletCircle,
  ELeafletMarkerColor,
  IGeoMapLeafletMarker,
  IGeoMapLeafletPolyline,
  IGeoMapLeafletRef,
} from "mhc-ui-components/dist/GeoMapLeaflet";

import {useTheme} from "mhc-ui-components/dist/ThemeProvider";

export interface IWorkzoneFormMapViewProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneFormMapView = (props: IWorkzoneFormMapViewProps): JSX.Element => {
  const theme = useTheme();
  const {
    useFormApi,
    useFormApi: {
      data: {
        point: referencePoint,
        path,
        broadcast,
      },
      addEventListener,
      removeEventListener,
    },
  } = props;

  const refMap = useRef<IGeoMapLeafletRef>(null);

  const markers: IGeoMapLeafletMarker[] = [];
  const polylines: IGeoMapLeafletPolyline[] = [];
  const circles: IGeoMapLeafletCircle[] = [];

  useEffect(() => {
    const handleFormLoad = () => refMap.current?.centerAllMarkers();
    addEventListener('load', handleFormLoad);
    return () => {
      removeEventListener('load', handleFormLoad);
    };
  }, [useFormApi]);

  // Reference point
  if (referencePoint.lng !== 0 && referencePoint.lat !== 0) {
    markers.push({
      markerId: 'referencePoint',
      position: referencePoint,
      color: ELeafletMarkerColor.RED,
      popUp: {children: 'Reference point'},
    });
  }

  // Path
  if (path.points.length) {
    markers.push({
      markerId: 'point-start',
      position: path.points[0],
      color: ELeafletMarkerColor.ORANGE,
      popUp: {children: 'Start'},
    });
    if (path.points.length > 1) {
      markers.push({
        markerId: 'point-end',
        position: path.points[path.points.length - 1],
        color: ELeafletMarkerColor.GREEN,
        popUp: {children: 'End'},
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
        weight: 8,
        fill: true,
        fillColor: 'red',
      },
    });
  }

  return (
    <FlexContainerVertical
      dataComponentName="WorkzoneFormMapView"
      fullHeight
      sx={{
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <GeoMapLeaflet
        id="CIMTAppMapID"
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
      />
    </FlexContainerVertical>
  );
};
