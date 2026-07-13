import { cva } from '@nild/shared';
import sharedStyles from '../../_shared/style';
import type { InputSize, InputVariant } from '../../input';

const trigger = cva<{
    variant?: InputVariant;
    size?: InputSize;
    block?: boolean;
    disabled?: boolean;
    open?: boolean;
}>(
    [
        'nd-date-picker-trigger',
        'group',
        'inline-flex',
        'items-center',
        'gap-2',
        'box-border',
        'font-nd',
        'overflow-hidden',
        'text-left',
        'border',
        'transition-colors',
        'outline-none',
        sharedStyles.disabled,
    ],
    {
        variants: {
            variant: {
                outlined: [
                    'bg-transparent',
                    'border-main',
                    'enabled:hover:border-brand-hover',
                    'enabled:focus-within:border-brand',
                    'enabled:focus-within:ring-focused',
                ],
                filled: [
                    'bg-muted',
                    'border-subtle',
                    'enabled:[&:hover:not(:focus-within)]:bg-muted-hover',
                    'enabled:[&:hover:not(:focus-within)]:border-muted',
                    'enabled:focus-within:border-brand',
                    'enabled:focus-within:ring-focused',
                ],
                underlined: [
                    'bg-transparent',
                    'border-transparent',
                    'border-b-main',
                    'enabled:[&:hover:not(:focus-within)]:border-b-brand-hover',
                    'enabled:focus-within:border-b-brand',
                ],
            },
            size: {
                small: ['h-6', 'text-sm'],
                medium: ['h-8', 'text-md'],
                large: ['h-10', 'text-lg'],
            },
            block: {
                true: ['flex', 'w-full'],
                false: '',
            },
            disabled: {
                true: '',
                false: 'cursor-pointer',
            },
            open: {
                true: ['z-1'],
                false: '',
            },
        },
        compoundVariants: [
            {
                variant: ['outlined', 'filled'],
                size: 'small',
                className: ['rounded-sm'],
            },
            {
                variant: ['outlined', 'filled'],
                size: ['medium', 'large'],
                className: ['rounded-md'],
            },
            {
                variant: ['outlined', 'filled'],
                open: true,
                className: ['border-brand', 'ring-focused'],
            },
            {
                variant: 'underlined',
                open: true,
                className: ['border-b-brand'],
            },
            {
                variant: 'filled',
                open: true,
                className: ['bg-muted-hover'],
            },
        ],
    },
);

const triggerButton = cva<object>([
    'min-w-0',
    'h-full',
    'flex-auto',
    'border-none',
    'bg-transparent',
    'p-0',
    'text-left',
    'outline-none',
    'cursor-inherit',
]);

const triggerContent = cva<{
    variant?: InputVariant;
    size?: InputSize;
    placeholder?: boolean;
}>(['nd-date-picker-trigger-content', 'block', 'min-w-0', 'truncate'], {
    variants: {
        placeholder: {
            true: ['text-subtle'],
            false: ['text-main'],
        },
    },
    compoundVariants: [
        {
            variant: ['outlined', 'filled'],
            size: 'small',
            className: ['pl-2'],
        },
        {
            variant: ['outlined', 'filled'],
            size: 'medium',
            className: ['pl-3'],
        },
        {
            variant: ['outlined', 'filled'],
            size: 'large',
            className: ['pl-4'],
        },
    ],
});

const triggerIcon = cva<{
    variant?: InputVariant;
    size?: InputSize;
    open?: boolean;
}>(
    [
        'nd-date-picker-trigger-icon',
        'shrink-0',
        'inline-flex',
        'items-center',
        'justify-center',
        'transition-colors',
        'group-focus-within:text-brand',
    ],
    {
        variants: {
            size: {
                small: ['text-sm'],
                medium: ['text-md'],
                large: ['text-lg'],
            },
            open: {
                true: ['text-brand'],
                false: ['text-muted'],
            },
        },
        compoundVariants: [
            {
                variant: ['outlined', 'filled'],
                size: 'small',
                className: ['pr-2'],
            },
            {
                variant: ['outlined', 'filled'],
                size: 'medium',
                className: ['pr-3'],
            },
            {
                variant: ['outlined', 'filled'],
                size: 'large',
                className: ['pr-4'],
            },
            {
                variant: 'underlined',
                className: ['pr-2'],
            },
        ],
    },
);

const clearButton = cva<{ size?: InputSize }>(
    [
        'nd-date-picker-clear',
        'inline-flex',
        'shrink-0',
        'items-center',
        'justify-center',
        'rounded-sm',
        'border-none',
        'bg-transparent',
        'p-0',
        'text-muted',
        'outline-none',
        'transition-colors',
        'enabled:cursor-pointer',
        'enabled:hover:bg-muted',
        'enabled:hover:text-main',
        'focus-visible:ring-focused',
    ],
    {
        variants: {
            size: {
                small: ['size-4'],
                medium: ['size-4.5'],
                large: ['size-5'],
            },
        },
    },
);

const customTrigger = cva<{ open?: boolean }>(
    ['nd-date-picker-custom-trigger', 'outline-none', 'focus-visible:ring-focused', sharedStyles.disabled],
    {
        variants: {
            open: {
                true: ['ring-focused'],
                false: '',
            },
        },
    },
);

const panel = cva<{ presetsVisible?: boolean }>(
    ['nd-date-picker-panel', 'font-nd', 'text-main', 'outline-none', 'p-1'],
    {
        variants: {
            presetsVisible: {
                true: ['flex', 'max-sm:flex-col'],
                false: '',
            },
        },
    },
);

const presetList = cva<object>([
    'nd-date-picker-presets',
    'flex',
    'w-34',
    'shrink-0',
    'flex-col',
    'gap-1',
    'border-r',
    'border-subtle',
    'p-2',
    'pl-0',
    'max-sm:w-auto',
    'max-sm:flex-row',
    'max-sm:flex-wrap',
    'max-sm:border-r-0',
    'max-sm:border-b',
    'max-sm:pl-2',
    'max-sm:pt-0',
]);

const preset = cva<object>([
    'nd-date-picker-preset',
    'rounded-sm',
    'border-none',
    'bg-transparent',
    'px-2',
    'py-1.5',
    'text-left',
    'text-sm',
    'text-main',
    'outline-none',
    'transition-colors',
    'enabled:cursor-pointer',
    'enabled:hover:bg-muted',
    'focus-visible:ring-focused',
    sharedStyles.disabled,
]);

const panelBody = cva<{ range?: boolean }>(['nd-date-picker-panel-body', 'gap-2', 'p-2'], {
    variants: {
        range: {
            true: ['flex', 'max-sm:flex-col'],
            false: ['block'],
        },
    },
});

const calendarView = cva<object>(['nd-date-picker-calendar', 'w-72', 'shrink-0']);

const panelHeader = cva<object>(['mb-2', 'grid', 'grid-cols-[auto_auto_1fr_auto_auto]', 'items-center', 'gap-1']);

const navButton = cva<object>([
    'inline-flex',
    'size-7',
    'items-center',
    'justify-center',
    'rounded-sm',
    'border-none',
    'bg-transparent',
    'p-0',
    'text-muted',
    'outline-none',
    'transition-colors',
    'enabled:cursor-pointer',
    'enabled:hover:bg-muted',
    'enabled:hover:text-main',
    'focus-visible:ring-focused',
    sharedStyles.disabled,
]);

const titleGroup = cva<object>(['flex', 'min-w-0', 'items-center', 'justify-center', 'gap-1']);

const titleButton = cva<object>([
    'min-w-0',
    'rounded-sm',
    'border-none',
    'bg-transparent',
    'px-2',
    'py-1',
    'text-md',
    'font-medium',
    'text-main',
    'outline-none',
    'transition-colors',
    'enabled:cursor-pointer',
    'enabled:hover:bg-muted',
    'focus-visible:ring-focused',
]);

const weekdayRow = cva<object>(['mb-1', 'grid', 'grid-cols-7']);

const weekday = cva<object>(['text-center', 'text-sm', 'text-main']);

const activeDescendantRing = 'focus-visible:[&_[data-active]]:ring-focused';

const grid = cva<object>([
    'nd-date-picker-grid',
    'grid',
    'grid-cols-7',
    'place-items-center',
    'gap-1',
    'outline-none',
    activeDescendantRing,
]);

const cell = cva<{
    disabled?: boolean;
    inRange?: boolean;
    outside?: boolean;
    rangeEnd?: boolean;
    rangeStart?: boolean;
    selected?: boolean;
    today?: boolean;
}>(
    [
        'nd-date-picker-cell',
        'relative',
        'flex',
        'size-8',
        'items-center',
        'justify-center',
        'rounded-sm',
        'text-md',
        'leading-none',
        'outline-none',
        'select-none',
        'transition-colors',
    ],
    {
        variants: {
            disabled: {
                true: ['cursor-not-allowed', 'text-subtle', 'opacity-60'],
                false: ['cursor-pointer'],
            },
            inRange: {
                true: ['bg-brand-subtle'],
                false: '',
            },
            outside: {
                true: ['text-subtle'],
                false: '',
            },
            rangeStart: {
                true: '',
                false: '',
            },
            rangeEnd: {
                true: '',
                false: '',
            },
            selected: {
                true: ['bg-brand', 'text-brand-contrast', 'hover:bg-brand-hover'],
                false: '',
            },
            today: {
                true: ['flex-col', 'gap-1'],
                false: '',
            },
        },
        compoundVariants: [
            {
                disabled: false,
                inRange: false,
                selected: false,
                className: ['hover:bg-muted'],
            },
            {
                inRange: true,
                disabled: false,
                selected: false,
                className: ['hover:bg-brand-subtle-hover'],
            },
            {
                rangeStart: true,
                className: ['rounded-l-md'],
            },
            {
                rangeEnd: true,
                className: ['rounded-r-md'],
            },
        ],
    },
);

const todayDot = cva<{ selected?: boolean }>(['size-1', 'shrink-0', 'rounded-full'], {
    variants: {
        selected: {
            true: ['bg-brand-contrast'],
            false: ['bg-brand'],
        },
    },
});

const viewGrid = cva<object>([
    'grid',
    'w-72',
    'grid-cols-3',
    'place-items-center',
    'gap-2',
    'outline-none',
    activeDescendantRing,
]);

const viewCell = cva<{
    disabled?: boolean;
    selected?: boolean;
}>(
    [
        'flex',
        'h-8',
        'w-20',
        'items-center',
        'justify-center',
        'rounded-sm',
        'text-md',
        'outline-none',
        'transition-colors',
    ],
    {
        variants: {
            disabled: {
                true: ['cursor-not-allowed', 'text-subtle', 'opacity-60'],
                false: ['cursor-pointer'],
            },
            selected: {
                true: ['bg-brand', 'text-brand-contrast', 'hover:bg-brand-hover'],
                false: '',
            },
        },
        compoundVariants: [
            {
                disabled: false,
                selected: false,
                className: ['hover:bg-muted-hover'],
            },
        ],
    },
);

export default {
    calendarView,
    cell,
    clearButton,
    customTrigger,
    grid,
    navButton,
    panel,
    panelBody,
    panelHeader,
    preset,
    presetList,
    titleButton,
    titleGroup,
    todayDot,
    trigger,
    triggerButton,
    triggerContent,
    triggerIcon,
    viewGrid,
    viewCell,
    weekday,
    weekdayRow,
};
