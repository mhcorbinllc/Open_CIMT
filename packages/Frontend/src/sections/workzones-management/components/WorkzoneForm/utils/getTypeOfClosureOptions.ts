import {
  EWZSimpleClosureType,
  EWZClosureTypeDeprecated,
  EWZSimpleClosureTypeLane,
  EWZSimpleClosureTypeShoulder,
  EWZSimpleClosureTypeReducedSpeed,
  EWZSimpleClosureTypeLeftTurn,
  EWZSimpleClosureTypeRightTurn,
  EWZSimpleClosureTypeHeightLimit,
} from "mhc-server";

import {
  IInputSelectOption,
  IInputSelectGroup,
} from "mhc-ui-components/dist/InputSelect";

import {
  convertEnumKeyToHumanReadable,
  convertEnumToIInputSelectOptions,
} from "mhc-ui-components/dist/utils";

interface IClosureTypeInputOptions {
  closureTypeGroupedOptions: IInputSelectGroup[];
  closureTypeOptions: IInputSelectOption[];
}

export const getTypeOfClosureInputOptions = (): IClosureTypeInputOptions => {
  return {
    closureTypeGroupedOptions: [
      {
        label: convertEnumKeyToHumanReadable(EWZSimpleClosureType.LANE_CLOSED, true),
        ariaLabel: convertEnumKeyToHumanReadable(EWZSimpleClosureType.LANE_CLOSED, true),
        options: convertEnumToIInputSelectOptions(EWZSimpleClosureTypeLane, {everyWord: true}),
      },
      {
        label: convertEnumKeyToHumanReadable(EWZSimpleClosureType.SHOULDER_CLOSED, true),
        ariaLabel: convertEnumKeyToHumanReadable(EWZSimpleClosureType.SHOULDER_CLOSED, true),
        options: convertEnumToIInputSelectOptions(EWZSimpleClosureTypeShoulder, {everyWord: true}),
      },
      {
        label: convertEnumKeyToHumanReadable(EWZSimpleClosureType.REDUCED_SPEED, true),
        ariaLabel: convertEnumKeyToHumanReadable(EWZSimpleClosureType.REDUCED_SPEED, true),
        options: convertEnumToIInputSelectOptions(EWZSimpleClosureTypeReducedSpeed, {everyWord: true}),
      },
      {
        label: convertEnumKeyToHumanReadable(EWZSimpleClosureType.LEFT_TURN, true),
        ariaLabel: convertEnumKeyToHumanReadable(EWZSimpleClosureType.LEFT_TURN, true),
        options: convertEnumToIInputSelectOptions(EWZSimpleClosureTypeLeftTurn, {everyWord: true}),
      },
      {
        label: convertEnumKeyToHumanReadable(EWZSimpleClosureType.RIGHT_TURN, true),
        ariaLabel: convertEnumKeyToHumanReadable(EWZSimpleClosureType.RIGHT_TURN, true),
        options: convertEnumToIInputSelectOptions(EWZSimpleClosureTypeRightTurn, {everyWord: true}),
      },
      {
        label: convertEnumKeyToHumanReadable(EWZSimpleClosureType.HEIGHT_LIMIT, true),
        ariaLabel: convertEnumKeyToHumanReadable(EWZSimpleClosureType.HEIGHT_LIMIT, true),
        options: convertEnumToIInputSelectOptions(EWZSimpleClosureTypeHeightLimit, {everyWord: true}),
      },
    ],
    closureTypeOptions: [
      {
        label: convertEnumKeyToHumanReadable(EWZSimpleClosureType.NONE, true),
        ariaLabel: convertEnumKeyToHumanReadable(EWZSimpleClosureType.NONE, true),
        value: EWZSimpleClosureType.NONE,
      },
      ...convertEnumToIInputSelectOptions(EWZClosureTypeDeprecated, {everyWord: true}),
    ],
  };
};
