import CheckSmall from '@nild/icons/CheckSmall';
import { cnMerge } from '@nild/shared';
import { ReactElement, ReactNode, isValidElement } from 'react';
import { SelectOptionProps } from './interfaces';
import variants from './style';

const Option = <T,>(props: SelectOptionProps<T>) => {
    const {
        size = 'medium',
        label,
        disabled = false,
        selected = false,
        children,
        className,
        onClick,
        onMouseDown,
        onMouseEnter,
        ...restProps
    } = props;

    return (
        <div
            {...restProps}
            aria-disabled={disabled || undefined}
            aria-selected={selected}
            className={cnMerge(
                variants.option({
                    size,
                    disabled,
                }),
                className,
            )}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            role="option"
        >
            <div className={variants.optionContent()}>
                {children ?? <span className={variants.optionLabel()}>{label}</span>}
            </div>
            <span
                aria-hidden="true"
                className={variants.optionIndicator({
                    size,
                })}
            >
                {selected ? <CheckSmall className="text-brand" size="1em" /> : null}
            </span>
        </div>
    );
};

Option.displayName = 'Select.Option';

export const isSelectOptionElement = <T,>(child: ReactNode): child is ReactElement<SelectOptionProps<T>> => {
    return isValidElement(child) && child.type === Option;
};

export default Option;
