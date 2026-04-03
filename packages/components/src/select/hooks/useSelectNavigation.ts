import { useEffectCallback, useIsomorphicLayoutEffect } from '@nild/hooks';
import { Dispatch, FocusEvent, KeyboardEvent, RefObject, SetStateAction, useRef, useState } from 'react';

interface UseSelectNavigationOptions {
    open: boolean;
    selectedIndex: number;
    enabledOptionIndices: number[];
    triggerRef: RefObject<HTMLButtonElement>;
    onOpen: () => void;
    onClose: () => void;
    onSelect: (index: number) => void;
}

interface UseSelectNavigationReturn {
    activeIndex: number;
    listboxRef: RefObject<HTMLDivElement>;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    handleTriggerKeyDown: (evt: KeyboardEvent<HTMLButtonElement>) => void;
    handleListboxKeyDown: (evt: KeyboardEvent<HTMLDivElement>) => void;
    handleListboxBlur: (evt: FocusEvent<HTMLDivElement>) => void;
    focusTrigger: () => void;
}

const getAdjacentIndex = (indices: number[], currentIndex: number, direction: 1 | -1) => {
    if (indices.length === 0) {
        return -1;
    }

    const position = indices.indexOf(currentIndex);

    if (position === -1) {
        return direction === 1 ? indices[0] : indices.at(-1)!;
    }

    const nextPosition = Math.min(Math.max(position + direction, 0), indices.length - 1);

    return indices[nextPosition];
};

export const useSelectNavigation = ({
    open,
    selectedIndex,
    enabledOptionIndices,
    triggerRef,
    onOpen,
    onClose,
    onSelect,
}: UseSelectNavigationOptions): UseSelectNavigationReturn => {
    const listboxRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    const focusTrigger = useEffectCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.requestAnimationFrame(() => {
            triggerRef.current?.focus();
        });
    });

    const moveActiveIndex = useEffectCallback((direction: 1 | -1) => {
        setActiveIndex(currentIndex => getAdjacentIndex(enabledOptionIndices, currentIndex, direction));
    });

    const moveToBoundary = useEffectCallback((direction: 'start' | 'end') => {
        if (enabledOptionIndices.length === 0) {
            return;
        }

        setActiveIndex(direction === 'start' ? enabledOptionIndices[0] : enabledOptionIndices.at(-1)!);
    });

    const handleTriggerKeyDown = useEffectCallback((evt: KeyboardEvent<HTMLButtonElement>) => {
        if (enabledOptionIndices.length === 0) {
            return;
        }

        if (evt.key === 'ArrowDown' || evt.key === 'ArrowUp') {
            evt.preventDefault();
            onOpen();
        }
    });

    const handleListboxKeyDown = useEffectCallback((evt: KeyboardEvent<HTMLDivElement>) => {
        switch (evt.key) {
            case 'ArrowDown':
                evt.preventDefault();
                moveActiveIndex(1);
                break;
            case 'ArrowUp':
                evt.preventDefault();
                moveActiveIndex(-1);
                break;
            case 'Home':
                evt.preventDefault();
                moveToBoundary('start');
                break;
            case 'End':
                evt.preventDefault();
                moveToBoundary('end');
                break;
            case 'Enter':
            case ' ':
                evt.preventDefault();
                onSelect(activeIndex);
                break;
            case 'Escape':
                evt.preventDefault();
                onClose();
                focusTrigger();
                break;
            case 'Tab':
                onClose();
                break;
            default:
                break;
        }
    });

    const handleListboxBlur = useEffectCallback((evt: FocusEvent<HTMLDivElement>) => {
        const nextTarget = evt.relatedTarget as Node | null;

        if (triggerRef.current?.contains(nextTarget) || listboxRef.current?.contains(nextTarget)) {
            return;
        }

        onClose();
    });

    useIsomorphicLayoutEffect(() => {
        if (!open) {
            setActiveIndex(-1);

            return;
        }

        setActiveIndex(selectedIndex >= 0 ? selectedIndex : (enabledOptionIndices[0] ?? -1));
    }, [enabledOptionIndices, open, selectedIndex]);

    useIsomorphicLayoutEffect(() => {
        if (!open || typeof window === 'undefined') {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            listboxRef.current?.focus();
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [open]);

    useIsomorphicLayoutEffect(() => {
        if (!open || activeIndex < 0 || typeof window === 'undefined') {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            const activeOption = listboxRef.current?.querySelectorAll('[role="option"]')[activeIndex] as
                | HTMLElement
                | undefined;

            activeOption?.scrollIntoView({ block: 'nearest' });
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [activeIndex, open]);

    return {
        activeIndex,
        listboxRef,
        setActiveIndex,
        handleTriggerKeyDown,
        handleListboxKeyDown,
        handleListboxBlur,
        focusTrigger,
    };
};
