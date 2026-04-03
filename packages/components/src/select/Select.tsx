import { useControllableState, useEffectCallback, useIsomorphicLayoutEffect } from '@nild/hooks';
import { Icon } from '@nild/icons';
import Down from '@nild/icons/Down';
import { cnMerge, forwardRefWithGenerics, mergeRefs } from '@nild/shared';
import { cloneElement, ForwardedRef, MouseEvent, ReactElement, ReactNode, useMemo, useRef, useState } from 'react';
import { mergeHandlers, registerSlots } from '../_shared/utils';
import Popup from '../popup';
import { useSelectNavigation } from './hooks';
import { MultipleSelectProps, SelectOptionProps, SelectProps, SingleSelectProps } from './interfaces';
import { isSelectOptionElement } from './Option';
import variants from './style';

const collectSlots = registerSlots({
    option: { isMatched: child => isSelectOptionElement(child), multiple: true },
});

interface ParsedOption<T> {
    key: string;
    selected: boolean;
    element: ReactElement<SelectOptionProps<T>>;
    props: SelectOptionProps<T>;
}

interface ParsedOptionsResult<T> {
    options: ParsedOption<T>[];
    enabledOptionIndices: number[];
    selectedIndex: number;
    selectedValues: T[];
    displayText: string;
    hasSelection: boolean;
}

const includesValue = <T,>(values: T[], value: T) => {
    return values.some(item => Object.is(item, value));
};

const normalizeSelectedValues = <T,>(value: T | T[] | undefined) => {
    return Array.isArray(value) ? value : [];
};

const areValuesEqual = <T,>(a: T[], b: T[]) => {
    return a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
};

const toggleSelectedValue = <T,>(values: T[], value: T) => {
    return includesValue(values, value) ? values.filter(item => !Object.is(item, value)) : values.concat(value);
};

const parseOptions = <T,>(
    children: ReactNode,
    multiple: boolean,
    selectedValue: T | T[] | undefined,
): ParsedOptionsResult<T> => {
    const { slots } = collectSlots(children);
    const optionElements = slots.option.el as ReactElement<SelectOptionProps<T>>[];
    const options: ParsedOption<T>[] = [];
    const enabledOptionIndices: number[] = [];
    const selectedLabels: string[] = [];
    const selectedValues = multiple ? normalizeSelectedValues(selectedValue) : [];

    let displayText = '';
    let hasSelection = false;
    let selectedIndex = -1;

    optionElements.forEach((optionElement, index) => {
        const optionProps = optionElement.props as SelectOptionProps<T>;
        const selected = multiple
            ? includesValue(selectedValues, optionProps.value)
            : Object.is(optionProps.value, selectedValue);

        options.push({
            key: optionElement.key?.toString() ?? `${slots.option.seq[index]}`,
            selected,
            element: optionElement,
            props: optionProps,
        });

        if (!optionProps.disabled) {
            enabledOptionIndices.push(index);
        }

        if (!selected) {
            return;
        }

        hasSelection = true;

        if (!optionProps.disabled && selectedIndex < 0) {
            selectedIndex = index;
        }

        if (multiple) {
            selectedLabels.push(optionProps.label);

            return;
        }

        displayText = optionProps.label;
    });

    return {
        options,
        enabledOptionIndices,
        selectedIndex,
        selectedValues,
        displayText: multiple ? selectedLabels.join(', ') : displayText,
        hasSelection,
    };
};

const preventMouseDownDefault = (evt: MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
};

const Select = forwardRefWithGenerics(<T,>(props: SelectProps<T>, ref: ForwardedRef<HTMLButtonElement>) => {
    const {
        className,
        children,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        onKeyDown: externalOnKeyDown,
        placeholder,
        variant = 'outlined',
        size = 'medium',
        block = false,
        disabled = false,
        placement = 'bottom-start',
        offset = 8,
        multiple = false,
        value: externalValue,
        defaultValue,
        onChange,
        ...restProps
    } = props as SelectProps<T> & { 'aria-label'?: string; 'aria-labelledby'?: string };

    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useControllableState<T | T[] | undefined>(
        externalValue,
        multiple ? normalizeSelectedValues(defaultValue) : defaultValue,
    );
    const { options, enabledOptionIndices, selectedIndex, selectedValues, displayText, hasSelection } = useMemo(
        () => parseOptions(children, multiple, selectedValue),
        [children, multiple, selectedValue],
    );
    const interactive = !disabled && enabledOptionIndices.length > 0;
    const visibleOpen = interactive && open;

    const openListbox = useEffectCallback(() => {
        if (interactive) {
            setOpen(true);
        }
    });

    const closeListbox = useEffectCallback(() => {
        setOpen(false);
    });

    const commitSingleSelection = useEffectCallback((nextValue: T | undefined) => {
        if (multiple) {
            return;
        }

        setSelectedValue(prevValue => {
            if (Object.is(prevValue, nextValue)) {
                return prevValue;
            }

            (onChange as SingleSelectProps<T>['onChange'] | undefined)?.(nextValue);

            return nextValue;
        });
    });

    const commitMultipleSelection = useEffectCallback((nextValues: T[]) => {
        if (!multiple) {
            return;
        }

        setSelectedValue(prevValue => {
            const previousValues = normalizeSelectedValues(prevValue);

            if (areValuesEqual(previousValues, nextValues)) {
                return prevValue;
            }

            (onChange as MultipleSelectProps<T>['onChange'] | undefined)?.(nextValues);

            return nextValues;
        });
    });

    const selectAt = useEffectCallback((index: number) => {
        const option = options[index];

        if (!option || option.props.disabled) {
            return;
        }

        if (multiple) {
            commitMultipleSelection(toggleSelectedValue(selectedValues, option.props.value));

            return;
        }

        commitSingleSelection(option.props.value);
        closeListbox();
        focusTrigger();
    });

    const { listboxRef, setActiveIndex, handleTriggerKeyDown, handleListboxKeyDown, handleListboxBlur, focusTrigger } =
        useSelectNavigation({
            open: visibleOpen,
            selectedIndex,
            enabledOptionIndices,
            triggerRef,
            onOpen: openListbox,
            onClose: closeListbox,
            onSelect: selectAt,
        });

    useIsomorphicLayoutEffect(() => {
        if (!interactive && open) {
            closeListbox();
        }
    }, [closeListbox, interactive, open]);

    const renderOption = (option: ParsedOption<T>, index: number) => {
        return cloneElement<SelectOptionProps<T>>(option.element, {
            key: option.key,
            size,
            onClick: mergeHandlers(option.props.onClick, () => {
                selectAt(index);
            }),
            onMouseDown: mergeHandlers(option.props.onMouseDown, preventMouseDownDefault),
            onMouseEnter: mergeHandlers(option.props.onMouseEnter, () => {
                if (!option.props.disabled) {
                    setActiveIndex(index);
                }
            }),
            selected: option.selected,
        });
    };

    return (
        <Popup
            action="click"
            arrowed={false}
            disabled={!interactive}
            offset={offset}
            open={visibleOpen}
            placement={placement}
            onClose={closeListbox}
            onOpen={openListbox}
        >
            <Popup.Trigger>
                <button
                    {...restProps}
                    aria-expanded={visibleOpen}
                    aria-haspopup="listbox"
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledby}
                    className={cnMerge(
                        variants.trigger({
                            variant,
                            size,
                            block,
                            disabled,
                            open: visibleOpen,
                        }),
                        className,
                    )}
                    disabled={disabled}
                    onKeyDown={mergeHandlers(externalOnKeyDown, handleTriggerKeyDown)}
                    ref={mergeRefs(ref, triggerRef)}
                    type="button"
                >
                    <span
                        className={variants.triggerContent({
                            size,
                            placeholder: !hasSelection,
                        })}
                    >
                        {hasSelection ? displayText : (placeholder ?? '')}
                    </span>
                    <span
                        aria-hidden="true"
                        className={variants.triggerIcon({
                            size,
                            open: visibleOpen,
                        })}
                    >
                        <Icon component={Down} />
                    </span>
                </button>
            </Popup.Trigger>
            <Popup.Portal>
                <div
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledby}
                    aria-multiselectable={multiple || undefined}
                    className={cnMerge(variants.portalContent(), variants.listbox())}
                    onBlur={handleListboxBlur}
                    onKeyDown={handleListboxKeyDown}
                    ref={listboxRef}
                    role="listbox"
                    style={{
                        minWidth: triggerRef.current?.offsetWidth,
                    }}
                    tabIndex={-1}
                >
                    {options.map(renderOption)}
                </div>
            </Popup.Portal>
        </Popup>
    );
});

(Select as unknown as { displayName: string }).displayName = 'Select';

export default Select;
