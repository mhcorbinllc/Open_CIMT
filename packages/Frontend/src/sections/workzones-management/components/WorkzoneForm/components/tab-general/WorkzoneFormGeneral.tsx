import moment from "moment";
import {dynaSwitch} from "dyna-switch";

import {
  IWorkzonesAppSettings,
  closureTypePresetValues,
  EWZClosureSelectionMode,
  EWZClosureType,
  EWZClosureTypeDeprecated,
} from "mhc-server";

import {Box} from "mhc-ui-components/dist/Box";

import {IUIWorkzone} from "../../IUIWorkzone";

import {
  Button,
  EButtonVariant,
  EButtonColor,
} from "mhc-ui-components/dist/Button";
import {
  Input,
  EInputType,
} from "mhc-ui-components/dist/Input";
import {
  LabelContainer,
  ELabelContainerVariant,
} from "mhc-ui-components/dist/LabelContainer";
import {
  InputSwitch,
} from "mhc-ui-components/dist/InputSwitch";
import {
  InputSelect,
} from "mhc-ui-components/dist/InputSelect";
import {
  InputMultiSelect,
  EInputMultiSelectItemType,
} from "mhc-ui-components/dist/InputMultiSelect";
import {
  InputDateTimePicker,
  EInputTimeMode,
} from "mhc-ui-components/dist/InputDateTimePicker";
import {
  GridItem,
  GridContainer,
} from "mhc-ui-components/dist/Grid";
import {
  IUseFormApi,
  EViewMode,
} from "mhc-ui-components/dist/useForm";
import {
  convertEnumToIInputSelectOptions,
} from "mhc-ui-components/dist/utils";

import DeleteIcon from "@mui/icons-material/DeleteForeverOutlined";
import UndeleteIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import {getTypeOfClosureInputOptions} from "../../utils/getTypeOfClosureOptions";

export interface IWorkzoneFormGeneralProps {
  workzoneAppSettings: IWorkzonesAppSettings;
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneFormGeneral = (props: IWorkzoneFormGeneralProps): JSX.Element => {
  const {
    workzoneAppSettings,
    useFormApi: {
      viewMode,
      change,
      buttons,
      isChanged,
      data: {
        active,
        name,
        closureType,
        closureSelectionMode,
        itisCodes: formItisCodes,
        start,
        end,
        forEver,
        closedLaneWidthInFeet,
        workersPresent,
      },
      validationResult: {dataValidation: validationErrors},
    },
  } = props;

  const readOnly = viewMode === EViewMode.VIEW;

  const deprecatedClosureTypes = Object.values(EWZClosureTypeDeprecated);

  const handleClosureTypeChange = (selectedClosureType_: string): void => {
    const selectedClosureType: EWZClosureType = selectedClosureType_ as any;

    const closureTypePresetValue = closureTypePresetValues[selectedClosureType];
    if (!closureTypePresetValue) return; // This would happen only due to different version with server app

    change({
      closureType: selectedClosureType,
      itisCodes: closureTypePresetValue.itisCodes,
      closedLane: closureTypePresetValue.closedLane,
      closedShoulder: closureTypePresetValue.closedShoulder,
      speedLimitInMiles: closureTypePresetValue.speedLimitInMiles,
    });
  };

  const handleItisCodesChange = (values: string[]): void => {
    change({
      itisCodes: values.map(Number),
      closureType: EWZClosureType.NONE,
    });
  };

  const handleStartChange = (start: Date) => change({start});

  const handleEndChange = (end: Date) => change({end});

  // Dev note: If the number of the days changed, consider updating also the point: #202108190832
  // Max date allowed for end date datetime picker
  const maxDate: Date =
    moment(start)
      .add(32000, 'minutes')
      .toDate();

  const {
    closureTypeGroupedOptions,
    closureTypeOptions,
  } = getTypeOfClosureInputOptions();

  return (
    <Box
      dataComponentName="WorkzoneFormGeneral"
      sx={{
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <GridContainer spacing={2}>

        <GridItem mobile={12} tablet={4}>
          <InputSwitch
            name="active"
            label="Active"
            ariaLabel="Is this CIM active or not"
            readOnly={readOnly}
            value={active}
            validationError={validationErrors.active}
          />
        </GridItem>

        <GridItem mobile={12} tablet={8}>
          <Input
            name="name"
            label="Name"
            autoFocus
            ariaLabel="CIM's name"
            readOnly={readOnly}
            value={name}
            validationError={validationErrors.name}
          />
        </GridItem>

        <GridItem mobile={12} tablet={4}>
          <InputSelect
            name="closureSelectionMode"
            label="Closure Mode"
            ariaLabel="Closure Selection Mode"
            readOnly={readOnly}
            options={convertEnumToIInputSelectOptions(EWZClosureSelectionMode)}
            value={closureSelectionMode.toString()}
            helperLabel={
              dynaSwitch<string>(
                closureSelectionMode,
                '',
                {
                  [EWZClosureSelectionMode.SIMPLE]: `Select Closure by one Simple "Type of closure" drop down.`,
                  [EWZClosureSelectionMode.CUSTOM]: `Select Closure by Custom "Itis codes", "Closed lane" and "Closed shoulder" drop downs`,
                },
              )
            }
            validationError={validationErrors.closureSelectionMode}
          />
        </GridItem>

        <GridItem
          mobile={12} tablet={8}
          hidden={closureSelectionMode === EWZClosureSelectionMode.CUSTOM}
        >
          <InputSelect
            label="Type of closure"
            ariaLabel="Type of closure"
            readOnly={readOnly}
            value={closureType}
            groupedOptions={closureTypeGroupedOptions}
            options={closureTypeOptions}
            deprecatedValues={deprecatedClosureTypes}
            listDeprecatedValues={false}
            onChange={handleClosureTypeChange}
            validationError={validationErrors.closureType}
          />
        </GridItem>

        <GridItem
          mobile={12} tablet={8}
          hidden={closureSelectionMode === EWZClosureSelectionMode.SIMPLE}
        >
          <InputMultiSelect
            readOnly={readOnly}
            label="ITIS codes"
            ariaLabel="ITIS codes"
            itemType={EInputMultiSelectItemType.CHIP}
            options={workzoneAppSettings.itisCodes.map(itisCode => ({
              value: itisCode.code.toString(),
              label: `(${itisCode.code}) ${itisCode.label}`,
            }))}
            value={formItisCodes.map(itisCode => itisCode.toString())}
            validationError={validationErrors.itisCodes}
            onChange={handleItisCodesChange}
          />
        </GridItem>


        <GridItem mobile={12} tablet={4}>
          <InputDateTimePicker
            timeMode={EInputTimeMode.AM_PM}
            name="start"
            label="Start"
            ariaLabel="Start"
            readOnly={readOnly}
            showTodayButton
            value={start}
            validationError={validationErrors.start}
            onChange={handleStartChange}
          />
        </GridItem>

        <GridItem mobile={12} tablet={4}>
          <InputDateTimePicker
            timeMode={EInputTimeMode.AM_PM}
            name="end"
            label="End"
            ariaLabel="End"
            readOnly={readOnly}
            showTodayButton
            minDate={start}
            maxDate={maxDate}
            value={forEver ? null : end}
            disabled={forEver}
            validationError={validationErrors.end}
            helperLabel={forEver ? 'No end date since the Unlimited Duration is switched on.' : undefined}
            onChange={handleEndChange}
          />
        </GridItem>

        <GridItem mobile={12} tablet={4}>
          <InputSwitch
            label="Unlimited Duration"
            ariaLabel="Unlimited Duration"
            readOnly={readOnly}
            name="forEver"
            value={forEver}
          />
        </GridItem>


        <GridItem mobile={12} tablet={8}>
          <Input
            name="closedLaneWidthInFeet"
            label="Closed lane width"
            ariaLabel="Closed lane width in feet"
            helperLabel="In feet (1-164)"
            readOnly={readOnly}
            type={EInputType.NUMBER}
            value={closedLaneWidthInFeet.toString()}
            validationError={validationErrors.closedLaneWidthInFeet}
          />
        </GridItem>

        <GridItem mobile={12} tablet={4}>
          <InputSwitch
            name="workersPresent"
            label="Workers present"
            ariaLabel="Are workers present"
            readOnly={readOnly}
            value={workersPresent}
            validationError={validationErrors.workersPresent}
          />
        </GridItem>


        <GridItem>
          {!buttons.delete.hidden && (
            <LabelContainer
              label="Tools"
              variant={ELabelContainerVariant.OUTLINED}
            >
              <Button
                icon={<DeleteIcon/>}
                variant={EButtonVariant.OUTLINED}
                color={EButtonColor.ERROR}
                disabled={buttons.delete.disabled}
                onClick={buttons.delete.handleClick}
              >
                {isChanged && 'Save Changes & '}
                Delete this CIM
              </Button>
            </LabelContainer>
          )}
          {!buttons.undelete.hidden && (
            <LabelContainer
              label="Tools"
              variant={ELabelContainerVariant.OUTLINED}
            >
              <Button
                icon={<UndeleteIcon/>}
                variant={EButtonVariant.OUTLINED}
                color={EButtonColor.ERROR}
                disabled={buttons.undelete.disabled}
                onClick={buttons.undelete.handleClick}
              >
                {isChanged && 'Save Changes & '}
                Undelete this CIM
              </Button>
            </LabelContainer>
          )}
        </GridItem>

      </GridContainer>
    </Box>
  );
};
