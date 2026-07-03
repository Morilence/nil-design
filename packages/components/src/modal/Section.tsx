import { cnMerge } from '@nild/shared';
import { ReactElement, ReactNode, forwardRef, isValidElement } from 'react';
import { BodyProps, FooterProps, HeaderProps } from './interfaces';
import variants from './style';

type SectionProps = {
    className?: string;
    children?: ReactNode;
};

const createModalSection = <Props extends SectionProps>(displayName: string, getClassName: () => string) => {
    const Section = forwardRef<HTMLDivElement, Props>(({ className, children, ...restProps }, ref) => {
        return (
            <div {...restProps} className={cnMerge(getClassName(), className)} ref={ref}>
                {children}
            </div>
        );
    });

    Section.displayName = displayName;

    return Section;
};

const isSectionElement = <Props,>(child: ReactNode, section: unknown): child is ReactElement<Props> => {
    return isValidElement(child) && child.type === section;
};

export const Header = createModalSection<HeaderProps>('Modal.Header', variants.header);
export const Body = createModalSection<BodyProps>('Modal.Body', variants.body);
export const Footer = createModalSection<FooterProps>('Modal.Footer', variants.footer);

export const isHeaderElement = (child: ReactNode): child is ReactElement<HeaderProps> => {
    return isSectionElement(child, Header);
};

export const isBodyElement = (child: ReactNode): child is ReactElement<BodyProps> => {
    return isSectionElement(child, Body);
};

export const isFooterElement = (child: ReactNode): child is ReactElement<FooterProps> => {
    return isSectionElement(child, Footer);
};
