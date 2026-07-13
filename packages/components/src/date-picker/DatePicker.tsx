import { forwardRef } from 'react';
import Picker from './Picker';
import type { DatePickerProps } from './interfaces';

/**
 * @category Components
 */
const DatePicker = forwardRef<HTMLElement, DatePickerProps>((props, ref) => (
    <Picker {...props} mode="single" ref={ref} />
));

DatePicker.displayName = 'DatePicker';

export default DatePicker;
