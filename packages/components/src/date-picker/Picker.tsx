import { useControllableState } from '@nild/hooks';
import { mergeRefs } from '@nild/shared';
import { Children, ReactElement, Ref, RefAttributes, cloneElement, forwardRef, isValidElement } from 'react';
import { mergeProps, registerSlots } from '../_shared/utils';
import Popup from '../popup';
import { DATE_FORMAT, formatDate } from './_shared/date';
import DefaultTrigger from './DefaultTrigger';
import usePickerModel from './hooks/usePickerModel';
import usePickerPopup from './hooks/usePickerPopup';
import Panel from './Panel';
import PresetButtons from './PresetButtons';
import variants from './style';
import { isTriggerElement } from './Trigger';
import type {
    DatePickerPreset,
    DatePickerProps,
    DatePickerTriggerProps,
    DatePickerValue,
    DateRangePickerProps,
    DateRangePickerValue,
} from './interfaces';

type TriggerElementProps = {
    'aria-controls'?: string;
    'aria-disabled'?: boolean;
    'aria-expanded'?: boolean;
    'aria-haspopup'?: string;
    'aria-readonly'?: boolean;
    className?: string;
    'data-disabled'?: boolean;
    disabled?: boolean;
    onKeyDown?: (evt: unknown) => void;
    role?: string;
    tabIndex?: number;
};

const collectSlots = registerSlots({
    trigger: { isMatched: isTriggerElement },
});

type PickerValue = DatePickerValue | DateRangePickerValue;
type PickerProps = ({ mode: 'single' } & DatePickerProps) | ({ mode: 'range' } & DateRangePickerProps);

const getDisplayText = (
    mode: PickerProps['mode'],
    value: PickerValue,
    format: PickerProps['format'],
    placeholder: PickerProps['placeholder'],
) => {
    if (mode === 'single') {
        return value instanceof Date
            ? formatDate(value, format ?? DATE_FORMAT)
            : Array.isArray(placeholder)
              ? placeholder[0]
              : (placeholder ?? 'Select date');
    }

    if (Array.isArray(value)) {
        return `${formatDate(value[0], format ?? DATE_FORMAT)} - ${formatDate(value[1], format ?? DATE_FORMAT)}`;
    }

    return Array.isArray(placeholder) ? placeholder.join(' - ') : (placeholder ?? 'Start date - End date');
};

const Picker = forwardRef<HTMLElement, PickerProps>((props, ref) => {
    const {
        allowClear = true,
        block = false,
        children,
        className,
        defaultOpen = false,
        defaultValue = null,
        disabled = false,
        fixedWeeks = true,
        format,
        isDateDisabled,
        maxDate,
        minDate,
        mode,
        offset = 8,
        onChange: externalOnChange,
        onClose,
        onKeyDown,
        onOpen,
        open,
        placeholder,
        placement = 'bottom-start',
        portalClassName,
        presets: externalPresets = [],
        readonly = false,
        size = 'medium',
        value: externalValue,
        variant = 'outlined',
        weekStartsOn = 0,
        ...buttonProps
    } = props;
    const onChange = externalOnChange as ((value: PickerValue) => void) | undefined;
    const presets = externalPresets as DatePickerPreset<PickerValue>[];
    const [value, setValue] = useControllableState<PickerValue>(externalValue, defaultValue);
    const popup = usePickerPopup({ defaultOpen, disabled, onClose, onOpen, open });
    const model = usePickerModel({
        closePanel: popup.closePanel,
        isDateDisabledByUser: isDateDisabled,
        maxDate,
        minDate,
        mode,
        onChange,
        readonly,
        setValue,
        value,
        visibleOpen: popup.visibleOpen,
    });
    const presetButtons = presets.length ? (
        <PresetButtons disabled={disabled} presets={presets} readonly={readonly} onSelect={model.commitValue} />
    ) : undefined;
    const { slots } = collectSlots(children);
    const customTriggerSlot = slots.trigger.el as ReactElement<DatePickerTriggerProps> | null;
    const customTrigger = customTriggerSlot
        ? Children.toArray(customTriggerSlot.props.children).find(isValidElement<TriggerElementProps>)
        : undefined;
    const customTriggerProps = customTriggerSlot
        ? (({ children: _children, ...rest }) => rest)(customTriggerSlot.props)
        : {};
    const customTriggerEl = customTrigger
        ? cloneElement(
              customTrigger,
              mergeProps(mergeProps(customTriggerProps, customTrigger.props as Record<string, unknown>), {
                  'aria-controls': popup.visibleOpen ? popup.panelId : undefined,
                  'aria-disabled': disabled || undefined,
                  'aria-expanded': popup.visibleOpen,
                  'aria-haspopup': 'dialog',
                  'aria-readonly': readonly || undefined,
                  className: variants.customTrigger({ open: popup.visibleOpen }),
                  ...(customTrigger.type === 'button' ? { disabled } : {}),
                  'data-disabled': disabled || undefined,
                  onKeyDown: popup.handleTriggerKeyDown,
                  ref: mergeRefs(ref, (customTrigger as { ref?: Ref<HTMLElement> }).ref, popup.triggerRef),
                  role:
                      customTrigger.type === 'button'
                          ? customTrigger.props.role
                          : (customTrigger.props.role ?? 'button'),
                  tabIndex: disabled ? -1 : (customTrigger.props.tabIndex ?? 0),
              } as TriggerElementProps & RefAttributes<HTMLElement> as Record<
                  string,
                  unknown
              >) as Partial<TriggerElementProps> & RefAttributes<HTMLElement>,
          )
        : undefined;

    return (
        <Popup
            action="click"
            arrowed={false}
            disabled={disabled}
            offset={offset}
            open={popup.visibleOpen}
            placement={placement}
            size="small"
            onClose={popup.closePanel}
            onOpen={popup.openPanel}
        >
            <Popup.Trigger>
                {customTriggerEl ?? (
                    <DefaultTrigger
                        {...buttonProps}
                        block={block}
                        buttonRef={mergeRefs(ref, popup.triggerRef)}
                        className={className}
                        clearable={allowClear && !disabled && !readonly && Boolean(value)}
                        disabled={disabled}
                        displayText={getDisplayText(mode, value, format, placeholder)}
                        empty={!value}
                        internalKeyDown={popup.handleTriggerKeyDown}
                        open={popup.visibleOpen}
                        panelId={popup.panelId}
                        readonly={readonly}
                        size={size}
                        variant={variant}
                        onClear={model.clear}
                        onKeyDown={onKeyDown}
                    />
                )}
            </Popup.Trigger>
            <Popup.Portal className={portalClassName}>
                <Panel
                    activeDate={model.activeDate}
                    activePanel={model.activePanel}
                    disabledOptions={model.disabledOptions}
                    draftRange={model.draftRange}
                    fixedWeeks={fixedWeeks}
                    id={popup.panelId}
                    open={popup.visibleOpen}
                    panelDates={model.panelDates}
                    presets={presetButtons}
                    previewRange={model.previewRange}
                    range={mode === 'range'}
                    value={mode === 'single' ? (value as DatePickerValue) : undefined}
                    view={model.view}
                    weekStartsOn={weekStartsOn}
                    onActiveDateChange={model.activateDate}
                    onClose={() => popup.closePanel(true)}
                    onPanelDateChange={model.changePanelDate}
                    onRangeHover={mode === 'range' ? model.setHoverDate : undefined}
                    onSelectDate={model.selectDate}
                    onViewChange={model.changeView}
                    onViewDateSelect={model.selectViewDate}
                    ref={popup.panelRef}
                />
            </Popup.Portal>
        </Popup>
    );
});

Picker.displayName = 'DatePicker.Picker';

export default Picker;
