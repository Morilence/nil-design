import DatePickerComponent from './DatePicker';
import DateRangePicker from './DateRangePicker';
import Trigger from './Trigger';

/**
 * @category Components
 */
const DatePicker = Object.assign(DatePickerComponent, {
    Range: DateRangePicker,
    Trigger,
});

export type {
    DatePickerPreset,
    DatePickerProps,
    DatePickerTriggerProps,
    DatePickerValue,
    DateRangePickerProps,
    DateRangePickerValue,
} from './interfaces';
export default DatePicker;
