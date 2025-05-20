import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  DatePickerProps,
  DatePicker as MuiDatePicker,
} from '@mui/x-date-pickers/DatePicker';
import CalendarOutline from '../icons/CalendarOutline';
import TextField from '@mui/material/TextField';

type DatePickerT = <TInputDate, TDate = TInputDate>(
  props: Omit<
    DatePickerProps<TInputDate, TDate> &
      React.RefAttributes<HTMLDivElement> & { placeholder?: string },
    'renderInput' | 'components'
  >
) => JSX.Element;

const DatePicker: DatePickerT = ({ placeholder = 'Select date', ...props }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <MuiDatePicker
        {...props}
        components={{
          OpenPickerIcon: CalendarOutline,
        }}
        renderInput={params => (
          <TextField
            {...params}
            inputProps={{
              ...params.inputProps,
              placeholder,
            }}
            autoComplete="bday"
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                flexDirection: 'row-reverse',
              },
              '& .MuiIconButton-root': { mx: 1 },
              '& .Mui-error .MuiOutlinedInput-notchedOutline': {
                borderColor: '#A8A8A8 !important',
              },
            }}
            required
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default DatePicker;
