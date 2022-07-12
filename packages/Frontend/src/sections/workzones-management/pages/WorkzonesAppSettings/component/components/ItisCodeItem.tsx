import {IItisCode} from "mhc-server";

import {
  FlexContainerHorizontal,
  FlexItemMin,
  FlexItemMax,
} from "mhc-ui-components/dist/FlexContainer";

import {
  Button,
  EButtonVariant,
} from "mhc-ui-components/dist/Button";
import {
  Input,
  EInputType,
} from "mhc-ui-components/dist/Input";
import {EViewMode} from "mhc-ui-components/dist/useForm";
import {convertStringToNumber} from "mhc-ui-components/dist/utils";

import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {EButtonColor} from "mhc-ui-components/dist/Button";

export interface IItisCodeItemProps {
  viewMode: EViewMode;
  itisCode: IItisCode;
  onChange: (itisCode: IItisCode) => void;
  onDelete: () => void;
}

export const ItisCodeItem = (props: IItisCodeItemProps): JSX.Element => {
  const {
    viewMode,
    itisCode,
    onChange,
    onDelete,
  } = props;

  const readOnly = viewMode === EViewMode.VIEW;

  const handleCodeChange = (code: string): void => {
    onChange(
      {
        ...itisCode,
        code: convertStringToNumber(code, itisCode.code),
      },
    );
  };

  const handleLabelChange = (label: string): void => {
    onChange(
      {
        ...itisCode,
        label,
      },
    );
  };

  return (
    <FlexContainerHorizontal
      dataComponentName="ItisCodeItem"
      spacing={1}
    >
      <FlexItemMax>
        <Input
          label="Code"
          ariaLabel="Code"
          readOnly={readOnly}
          type={EInputType.NUMBER}
          value={itisCode.code.toString()}
          onBlur={handleCodeChange}
        />
      </FlexItemMax>
      <FlexItemMax>
        <Input
          label="Label"
          ariaLabel="Label"
          readOnly={readOnly}
          value={itisCode.label}
          onBlur={handleLabelChange}
        />
      </FlexItemMax>
      <FlexItemMin>
        <Button
          color={EButtonColor.ERROR}
          variant={EButtonVariant.OUTLINED}
          disabled={readOnly}
          icon={<DeleteIcon/>}
          onClick={onDelete}
        />
      </FlexItemMin>
    </FlexContainerHorizontal>
  );
};
