import {IUIWorkzone} from "../../IUIWorkzone";
import {Box} from "mhc-ui-components/dist/Box";
import {Input} from "mhc-ui-components/dist/Input";
import {
  EViewMode,
  IUseFormApi,
} from "mhc-ui-components/dist/useForm";

export interface IWorkzoneNotesProps {
  useFormApi: IUseFormApi<IUIWorkzone>;
}

export const WorkzoneNotes = (props: IWorkzoneNotesProps): JSX.Element => {
  const {
    useFormApi: {
      viewMode,
      data: {notes},
      validationResult: {dataValidation: validationErrors},
    },
  } = props;

  return (
    <Box fullHeight dataComponentName="WorkzoneNotes">
      <Input
        sx={{maxHeight: '100%'}}
        name="notes"
        label="Notes"
        ariaLabel="Notes for this CIM"
        minRows={3}
        maxRows={10}
        maxLength={10000}
        readOnly={viewMode === EViewMode.VIEW}
        validationError={validationErrors.notes}
        value={notes}
      />
    </Box>
  );
};
