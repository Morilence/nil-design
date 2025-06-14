import { useStableCallback } from '@nild/hooks';
import { FC, HTMLAttributes, ReactNode } from 'react';
import { usePopup } from '../_shared/hooks';
import Portal from '../portal';
import Trigger, { TriggerAction } from '../trigger';
import type { Placement, OffsetOptions } from '@floating-ui/dom';

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    placement?: Placement;
    offset?: OffsetOptions;
    action?: TriggerAction | TriggerAction[];
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const Popover: FC<PopoverProps> & {
    Trigger: typeof Trigger;
    Portal: typeof Portal;
} = ({ children, placement, offset, action, open: externalOpen, defaultOpen, onOpenChange }) => {
    const [_open, { setOpen, renderTrigger, renderPortal }] = usePopup(children, {
        placement,
        offset,
        open: externalOpen,
        defaultOpen,
    });

    const handleToggle = useStableCallback(() => {
        setOpen(v => {
            onOpenChange?.(!v);

            return !v;
        });
    });

    const handleOpen = useStableCallback(() => {
        setOpen(() => {
            onOpenChange?.(true);

            return true;
        });
    });

    const handleClose = useStableCallback(() => {
        setOpen(() => {
            onOpenChange?.(false);

            return false;
        });
    });

    return (
        <>
            {renderTrigger({ action, onToggle: handleToggle, onOpen: handleOpen, onClose: handleClose })}
            {renderPortal()}
        </>
    );
};

Popover.displayName = 'Popover';
Popover.Trigger = Trigger;
Popover.Portal = Portal;

export default Popover;
