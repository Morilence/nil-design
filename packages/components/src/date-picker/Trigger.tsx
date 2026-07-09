import { FC, ReactNode, isValidElement } from 'react';
import type { DatePickerTriggerProps } from './interfaces';

const Trigger: FC<DatePickerTriggerProps> = ({ children }) => children ?? null;

export const isTriggerElement = (child: ReactNode) => isValidElement(child) && child.type === Trigger;

Trigger.displayName = 'DatePicker.Trigger';

export default Trigger;
