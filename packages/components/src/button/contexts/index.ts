import { createContextSuite } from '@nild/shared';
import { GroupProps } from '../interfaces';

const [GroupProvider, useGroupContext] = createContextSuite<
    Pick<GroupProps, 'variant' | 'size' | 'equal' | 'disabled'>
>({
    defaultValue: {
        variant: 'solid',
        size: 'medium',
        equal: false,
        disabled: false,
    },
});

export { GroupProvider, useGroupContext };
