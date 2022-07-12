import {
  useEffect,
  useRef,
} from "react";

import {EWZHeading} from "mhc-server";

import {IUIWorkzone} from "../../../IUIWorkzone";
import {appConfig} from "../../../../../../application/config/appConfig";
import {getHeadingAriaLablesByIndex} from "../../../utils/getHeadingAriaLabelsByIndex";

import {
  FlexContainerVertical,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";
import {
  IUseFormApi,
  EViewMode,
} from "mhc-ui-components/dist/useForm";
import {
  GeoMapLeaflet,
  EMapType,
  IGeoMapLeafletCircle,
  ELeafletMarkerColor,
  IGeoMapLeafletMarker,
  IGeoMapLeafletPolyline,
  IHeadingSlice,
  IGeoMapLeafletRef,
} from "mhc-ui-components/dist/GeoMapLeaflet";
import {
  Alert,
  EAlertType,
  EAlertVariant,
} from "mhc-ui-components/dist/Alert";

export interface IWorkzoneFormReferencePointProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneFormHeading = (props: IWorkzoneFormReferencePointProps): JSX.Element => {
  const {
    useFormApi,
    useFormApi: {
      viewMode,
      data: {
        point: referencePoint,
        heading,
        path,
      },
      change,
      validationResult: {dataValidation: validationErrors},
      addEventListener,
      removeEventListener,
    },
  } = props;

  const refMap = useRef<IGeoMapLeafletRef>(null);

  const hasPoint = referencePoint.lat !== 0 && referencePoint.lng !== 0;

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

  const headings: IHeadingSlice[] =
    Object.keys(EWZHeading)
      .reduce((arr: IHeadingSlice[], key: string, index: number) => {
        if (!arr.find(heading => heading.value === key)) {
          arr.push({
            value: EWZHeading[key],
            ariaLabel: getHeadingAriaLablesByIndex(index),
            selected: heading.includes(EWZHeading[key]),
          });
        }
        return arr;
      }, []);

  const handleHeadingClick = (selection: EWZHeading) => {
    let temp = heading;
    if (temp.includes(selection)) {
      temp = temp.filter((heading: string) => heading !== selection);
    }
    else {
      temp.push(selection);
    }
    change({heading: temp});
  };

  const headingsSelectDeselectHandler = () => {
    if (heading.length !== headings.length) {
      const allHeadings =
        Object.keys(EWZHeading)
          .reduce((arr: EWZHeading[], key: string) => {
            if (!arr.find(heading => heading === key)) {
              arr.push(EWZHeading[key]);
            }
            return arr;
          }, []);
      change({heading: allHeadings});
    }
    else {
      change({heading: []});
    }
  };

  // Path
  if (path.points.length) {
    markers.push({
      markerId: 'start',
      position: path.points[0],
      color: ELeafletMarkerColor.ORANGE,
      opacity: 0.25,
    });
    if (path.points.length > 1) {
      markers.push({
        markerId: 'end',
        position: path.points[path.points.length - 1],
        color: ELeafletMarkerColor.GREEN,
        opacity: 0.25,
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

  return (
    <FlexContainerVertical
      fullHeight
      dataComponentName="WorkzoneFormHeading"
    >
      <FlexItemMin>
        <Alert
          show={viewMode === EViewMode.VIEW && !hasPoint && !validationErrors['point']}
          type={EAlertType.INFO}
          variant={EAlertVariant.OUTLINED}
          title="No reference point is defined."
        >
          To select the directional heading, first click the Refernce Point tab to set the reference point.
        </Alert>
        <Alert
          show={viewMode === EViewMode.EDIT && !hasPoint && !validationErrors['point']}
          type={EAlertType.INFO}
          variant={EAlertVariant.OUTLINED}
          title="Define the reference point."
        >
          Click the Refernce Point tab to set the reference point.
        </Alert>
        <Alert
          type={EAlertType.ERROR}
          show={!!validationErrors['heading']}
          title="Input error"
        >
          {validationErrors['heading']}
        </Alert>
      </FlexItemMin>
      <FlexItemMax>
        <GeoMapLeaflet
          id="CIMTAppMapID"
          ref={refMap}
          gestureZoom
          readOnly={viewMode === EViewMode.VIEW}
          fullScreenButton
          centerMarkersButton={markers && markers.length > 0}
          googleMapApiKey={appConfig.googleMapsApiKey}
          availableMapTypes={[
            EMapType.ROADMAP,
            EMapType.SATELLITE,
            EMapType.TERRAIN,
            EMapType.HYBRID,
          ]}
          headingSelector={{
            position: referencePoint,
            headings,
            circleRadius: 35,
            onSliceClick: handleHeadingClick,
            onSelectDeselectClick: headingsSelectDeselectHandler,
          }}
          markers={markers}
          polylines={polylines}
          circles={circles}
        />
      </FlexItemMax>
    </FlexContainerVertical>
  );
};
