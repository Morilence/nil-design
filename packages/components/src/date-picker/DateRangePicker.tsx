import { forwardRef } from 'react';
import Picker from './Picker';
import type { DateRangePickerProps } from './interfaces';

/**
 * @category Components
 */
const DateRangePicker = forwardRef<HTMLElement, DateRangePickerProps>((props, ref) => (
    <Picker {...props} mode="range" ref={ref} />
));

DateRangePicker.displayName = 'DateRangePicker';

export default DateRangePicker;
