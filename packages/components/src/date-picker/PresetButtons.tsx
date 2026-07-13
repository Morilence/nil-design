import { Fragment } from 'react';
import variants from './style';
import type { DatePickerPreset } from './interfaces';

interface PresetButtonsProps<TValue> {
    disabled: boolean;
    presets: DatePickerPreset<TValue>[];
    readonly: boolean;
    onSelect: (value: TValue, closeOnSelect?: boolean) => void;
}

const PresetButtons = <TValue,>({ disabled, onSelect, presets, readonly }: PresetButtonsProps<TValue>) => (
    <Fragment>
        {presets.map((preset, index) => {
            const { closeOnSelect = true, disabled: presetDisabled = false, label, value } = preset;

            return (
                <button
                    className={variants.preset()}
                    disabled={disabled || presetDisabled}
                    key={index}
                    onClick={() => {
                        if (readonly || presetDisabled) return;

                        onSelect(typeof value === 'function' ? (value as () => TValue)() : value, closeOnSelect);
                    }}
                    type="button"
                >
                    {label}
                </button>
            );
        })}
    </Fragment>
);

PresetButtons.displayName = 'PresetButtons';

export default PresetButtons;
