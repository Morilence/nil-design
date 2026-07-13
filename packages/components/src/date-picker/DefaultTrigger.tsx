import { Icon } from '@nild/icons';
import Calendar from '@nild/icons/Calendar';
import CloseSmall from '@nild/icons/CloseSmall';
import { cnMerge } from '@nild/shared';
import { ButtonHTMLAttributes, KeyboardEventHandler, MouseEvent, Ref, forwardRef } from 'react';
import { mergeHandlers } from '../_shared/utils';
import variants from './style';
import type { InputSize, InputVariant } from '../input';

interface DefaultTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    block?: boolean;
    buttonRef: Ref<HTMLButtonElement>;
    clearable?: boolean;
    disabled: boolean;
    displayText: string;
    empty?: boolean;
    internalKeyDown: KeyboardEventHandler<HTMLButtonElement>;
    open: boolean;
    panelId: string;
    readonly: boolean;
    size?: InputSize;
    variant?: InputVariant;
    onClear?: () => void;
}

const DefaultTrigger = forwardRef<HTMLSpanElement, DefaultTriggerProps>((props, popupTriggerRef) => {
    const {
        block,
        buttonRef,
        className,
        clearable = false,
        disabled,
        displayText,
        empty = false,
        internalKeyDown,
        open,
        onClear,
        onKeyDown,
        panelId,
        readonly,
        size = 'medium',
        variant = 'outlined',
        ...restProps
    } = props;
    const handleClearMouseDown = (evt: MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault();
        evt.stopPropagation();
    };

    const handleClearClick = (evt: MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault();
        evt.stopPropagation();
        onClear?.();
    };

    return (
        <span
            className={cnMerge(variants.trigger({ variant, size, block, disabled, open }), className)}
            data-disabled={disabled || undefined}
            ref={popupTriggerRef}
        >
            <button
                {...restProps}
                aria-controls={open ? panelId : undefined}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-readonly={readonly || undefined}
                className={variants.triggerButton()}
                disabled={disabled}
                onKeyDown={mergeHandlers(onKeyDown, internalKeyDown)}
                ref={buttonRef}
                type="button"
            >
                <span className={variants.triggerContent({ variant, size, placeholder: empty })}>{displayText}</span>
            </button>
            {clearable && (
                <button
                    aria-label="Clear date"
                    className={variants.clearButton({ size })}
                    onClick={handleClearClick}
                    onMouseDown={handleClearMouseDown}
                    type="button"
                >
                    <Icon component={CloseSmall} />
                </button>
            )}
            <span aria-hidden="true" className={variants.triggerIcon({ variant, size, open })}>
                <Icon component={Calendar} />
            </span>
        </span>
    );
});

DefaultTrigger.displayName = 'DatePicker.DefaultTrigger';

export default DefaultTrigger;
