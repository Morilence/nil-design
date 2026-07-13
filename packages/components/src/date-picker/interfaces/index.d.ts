import type { InputSize, InputVariant } from '../../input';
import type { OffsetOptions, Placement } from '@floating-ui/dom';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactElement, ReactNode } from 'react';

export type DatePickerValue = Date | null;
export type DateRangePickerValue = readonly [Date, Date] | null;

export interface DatePickerPreset<TValue> {
    label: ReactNode;
    value: TValue | (() => TValue);
    disabled?: boolean;
    closeOnSelect?: boolean;
}

export interface DatePickerBaseProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'defaultValue' | 'onChange' | 'size' | 'value'> {
    children?: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    minDate?: Date;
    maxDate?: Date;
    isDateDisabled?: (date: Date) => boolean;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    format?: string | ((date: Date) => string);
    allowClear?: boolean;
    fixedWeeks?: boolean;
    variant?: InputVariant;
    size?: InputSize;
    block?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    placement?: Placement;
    offset?: OffsetOptions;
    portalClassName?: string;
}

export interface DatePickerProps extends DatePickerBaseProps {
    value?: DatePickerValue;
    defaultValue?: DatePickerValue;
    onChange?: (value: DatePickerValue) => void;
    presets?: DatePickerPreset<DatePickerValue>[];
}

export interface DateRangePickerProps
    extends Omit<DatePickerBaseProps, 'defaultValue' | 'onChange' | 'placeholder' | 'value'> {
    value?: DateRangePickerValue;
    defaultValue?: DateRangePickerValue;
    onChange?: (value: DateRangePickerValue) => void;
    placeholder?: [string, string] | string;
    presets?: DatePickerPreset<DateRangePickerValue>[];
}

export interface DatePickerTriggerProps extends HTMLAttributes<HTMLElement> {
    children?: ReactElement;
}
