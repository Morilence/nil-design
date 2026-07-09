import { useControllableState, useRaf } from '@nild/hooks';
import { KeyboardEvent, useId, useRef } from 'react';

interface UsePickerPopupOptions {
    defaultOpen?: boolean;
    disabled: boolean;
    onClose?: () => void;
    onOpen?: () => void;
    open?: boolean;
}

const usePickerPopup = ({
    defaultOpen = false,
    disabled,
    onClose,
    onOpen,
    open: externalOpen,
}: UsePickerPopupOptions) => {
    const panelId = useId();
    const triggerRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useControllableState(externalOpen, defaultOpen);
    const focusTriggerFrame = useRaf(() => triggerRef.current?.focus());
    const visibleOpen = open && !disabled;

    const openPanel = () => {
        if (disabled || open) return;

        setOpen(true);
        onOpen?.();
    };

    const closePanel = (focusTrigger = false) => {
        if (open) {
            setOpen(false);
            onClose?.();
        }

        if (focusTrigger) focusTriggerFrame.run();
    };

    const handleTriggerKeyDown = (evt: KeyboardEvent<HTMLElement>) => {
        if (evt.defaultPrevented || disabled) return;

        switch (evt.key) {
            case 'ArrowDown':
            case 'Enter':
            case ' ':
                evt.preventDefault();
                openPanel();
                break;
            case 'Escape':
                if (visibleOpen) {
                    evt.preventDefault();
                    closePanel(true);
                }
                break;
            default:
                break;
        }
    };

    return {
        closePanel,
        handleTriggerKeyDown,
        openPanel,
        panelId,
        panelRef,
        triggerRef,
        visibleOpen,
    };
};

export default usePickerPopup;
