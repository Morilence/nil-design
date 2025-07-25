import { Theme as ParkIconTheme, IconWrapper, StrokeLinecap, StrokeLinejoin } from '@icon-park/react/es/runtime';
import { cnMerge, isFunction, pascalize } from '@nild/shared';
import { HTMLAttributes, ComponentType, FC, useState, useEffect } from 'react';
import type { IconVariant } from './_shared/interfaces';

export interface DynamicIconProps extends HTMLAttributes<HTMLSpanElement> {
    name?: string;
    variant?: IconVariant;
    strokeWidth?: number;
    strokeLinecap?: StrokeLinecap;
    strokeLinejoin?: StrokeLinejoin;
    fill?: string | string[];
    spin?: boolean;
}

const iconImporters = import.meta.glob<false, string, ComponentType<unknown>>(
    '/node_modules/@icon-park/react/es/icons/*.js',
    {
        eager: false,
        import: 'default',
    },
);
const iconCaches = new Map<string, ComponentType<unknown>>();

/**
 * @category Components
 */
const DynamicIcon: FC<DynamicIconProps> = ({ className, name = '', variant = 'outlined', ...restProps }) => {
    const resolvedName = pascalize(name);
    const resolvedTheme =
        (
            {
                outlined: 'outline',
            } as Record<IconVariant, ParkIconTheme>
        )[variant] ?? variant;
    const importer = iconImporters[`/node_modules/@icon-park/react/es/icons/${resolvedName}.js`];
    const commonProps = {
        ...restProps,
        theme: resolvedTheme,
        className: cnMerge('nd-icon', 'text-[color:inherit] text-[length:inherit]', className),
    };
    const [ImportedIcon, setImportedIcon] = useState<ComponentType<unknown> | null>(
        () => iconCaches.get(resolvedName) ?? null,
    );

    useEffect(() => {
        if (iconCaches.has(resolvedName)) {
            setImportedIcon(() => iconCaches.get(resolvedName) ?? null);
        } else if (isFunction(importer)) {
            importer().then(SvgIcon => {
                setImportedIcon(() => {
                    iconCaches.set(resolvedName, SvgIcon);

                    return SvgIcon;
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedName]);

    if (!ImportedIcon) {
        const PlaceholderIcon = IconWrapper('placeholder-icon', false, ({ size }) => (
            <svg width={size} height={size}></svg>
        ));

        return <PlaceholderIcon {...commonProps} />;
    }

    return <ImportedIcon {...commonProps} />;
};

DynamicIcon.displayName = 'DynamicIcon';

export default DynamicIcon;
