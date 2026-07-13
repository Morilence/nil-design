import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DatePicker from '..';
import { DatePicker as RootDatePicker } from '../../index';
import type { DateRangePickerProps } from '../../index';

vi.mock('@floating-ui/dom', () => ({
    autoUpdate: vi.fn(() => vi.fn()),
    computePosition: vi.fn(() =>
        Promise.resolve({
            x: 0,
            y: 0,
            placement: 'bottom-start',
            middlewareData: {
                arrow: { x: 0, y: 0 },
            },
        }),
    ),
    offset: vi.fn(() => ({ name: 'offset' })),
    shift: vi.fn(() => ({ name: 'shift' })),
    flip: vi.fn(() => ({ name: 'flip' })),
    arrow: vi.fn(() => ({ name: 'arrow' })),
}));

const openPicker = async (name = 'Select date') => {
    fireEvent.click(screen.getByRole('button', { name }));

    return waitFor(() => screen.getByRole('dialog'));
};

const getDateCell = (label: RegExp) => screen.getAllByRole('gridcell', { name: label })[0];

describe('DatePicker', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date(2026, 6, 1));
        vi.clearAllMocks();
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(0);

            return 0;
        });
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('is exported from the package root and renders a formatted default value', () => {
        render(<DatePicker defaultValue={new Date(2026, 6, 7)} />);

        expect(RootDatePicker).toBe(DatePicker);
        expect(screen.getByRole('button', { name: '2026-07-07' })).toBeInTheDocument();
    });

    it('supports date-fns format tokens', () => {
        render(<DatePicker defaultValue={new Date(2026, 6, 7)} format="MMM do, yyyy" />);

        expect(screen.getByRole('button', { name: 'Jul 7th, 2026' })).toBeInTheDocument();
    });

    it('opens from the trigger and commits a single date', async () => {
        const onChange = vi.fn();

        render(<DatePicker placeholder="Pick date" onChange={onChange} />);

        await openPicker('Pick date');
        fireEvent.click(getDateCell(/Tuesday, July 7, 2026/));

        expect(onChange).toHaveBeenCalledWith(expect.any(Date));
        expect(screen.getByRole('button', { name: '2026-07-07' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('moves focus into the active grid when opened', async () => {
        render(<DatePicker />);

        await openPicker();

        await waitFor(() => expect(screen.getByRole('grid', { name: 'Choose date' })).toHaveFocus());
    });

    it('keeps the panel open when focus moves outside', async () => {
        const onClose = vi.fn();

        render(
            <>
                <button type="button">Outside</button>
                <DatePicker onClose={onClose} />
            </>,
        );

        await openPicker();
        screen.getByRole('button', { name: 'Outside' }).focus();

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('clears without opening the panel', () => {
        const onChange = vi.fn();

        render(<DatePicker defaultValue={new Date(2026, 6, 7)} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));

        expect(onChange).toHaveBeenCalledWith(null);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('marks disabled dates and does not commit them', async () => {
        const onChange = vi.fn();

        render(
            <DatePicker
                isDateDisabled={date => date.getDay() === 0 || date.getDay() === 6}
                maxDate={new Date(2026, 6, 31)}
                minDate={new Date(2026, 6, 1)}
                onChange={onChange}
            />,
        );

        await openPicker();

        const disabledCell = getDateCell(/Sunday, July 5, 2026, disabled/);

        expect(disabledCell).toHaveAttribute('aria-disabled', 'true');

        fireEvent.click(disabledCell);

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('opens in readonly mode without committing or clearing', async () => {
        const onChange = vi.fn();

        render(<DatePicker defaultValue={new Date(2026, 6, 7)} readonly onChange={onChange} />);

        const trigger = screen.getByRole('button', { name: '2026-07-07' });

        expect(trigger).toHaveAttribute('aria-readonly', 'true');
        expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();

        await openPicker('2026-07-07');
        fireEvent.click(getDateCell(/Thursday, July 9, 2026/));

        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('dialog')).toBeVisible();
    });

    it('uses the environment locale for calendar labels', async () => {
        vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('zh-CN');

        render(<DatePicker />);

        await openPicker();

        expect(screen.getByRole('button', { name: '七月' })).toBeInTheDocument();
        expect(screen.getByText('周日')).toBeInTheDocument();
    });

    it('does not apply range panel boundaries to a single picker month view', async () => {
        render(<DatePicker defaultValue={new Date(2026, 6, 7)} />);

        await openPicker('2026-07-07');
        fireEvent.click(screen.getByRole('button', { name: 'July' }));

        expect(screen.getByRole('gridcell', { name: 'Aug' })).not.toHaveAttribute('aria-disabled');
        expect(screen.getByRole('gridcell', { name: 'Dec' })).not.toHaveAttribute('aria-disabled');
    });

    it('commits a completed range after the second date', async () => {
        const onChange = vi.fn();

        render(<DatePicker.Range placeholder="Pick range" onChange={onChange} />);

        await openPicker('Pick range');
        fireEvent.click(getDateCell(/Tuesday, July 7, 2026/));

        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(getDateCell(/Thursday, July 16, 2026/));

        expect(onChange).toHaveBeenCalledWith([expect.any(Date), expect.any(Date)]);
        expect(screen.getByRole('button', { name: '2026-07-07 - 2026-07-16' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
    });

    it('joins range placeholder labels', () => {
        const props: DateRangePickerProps = { placeholder: ['Start', 'End'] };

        render(<DatePicker.Range {...props} />);

        expect(screen.getByRole('button', { name: 'Start - End' })).toBeInTheDocument();
    });

    it('automatically restarts a completed range from the start endpoint', async () => {
        const onChange = vi.fn();

        render(<DatePicker.Range defaultValue={[new Date(2026, 6, 7), new Date(2026, 6, 16)]} onChange={onChange} />);

        await openPicker('2026-07-07 - 2026-07-16');
        fireEvent.click(getDateCell(/Thursday, July 9, 2026/));

        expect(onChange).not.toHaveBeenCalled();

        fireEvent.click(getDateCell(/Monday, July 20, 2026/));

        expect(onChange).toHaveBeenCalledWith([expect.any(Date), expect.any(Date)]);
    });

    it('applies range visuals only in the date owning panel', async () => {
        render(<DatePicker.Range defaultValue={[new Date(2026, 6, 30), new Date(2026, 7, 8)]} />);

        await openPicker('2026-07-30 - 2026-08-08');

        const selectedCells = screen.getAllByRole('gridcell', { name: /Thursday, July 30, 2026/ });
        const inRangeCells = screen.getAllByRole('gridcell', { name: /Saturday, August 1, 2026/ });

        expect(selectedCells).toHaveLength(2);
        expect(selectedCells[0]).toHaveAttribute('aria-selected', 'true');
        expect(selectedCells[1]).not.toHaveAttribute('aria-selected');
        expect(selectedCells[1]).not.toHaveClass('bg-brand');
        expect(selectedCells[1]).toHaveClass('hover:bg-muted');
        expect(inRangeCells[0]).not.toHaveClass('bg-brand-subtle');
        expect(inRangeCells[1]).toHaveClass('bg-brand-subtle');
    });

    it('previews the pending end date with the end selected style', async () => {
        const onChange = vi.fn();

        render(<DatePicker.Range placeholder="Pick range" onChange={onChange} />);

        await openPicker('Pick range');
        fireEvent.click(getDateCell(/Tuesday, July 7, 2026/));
        fireEvent.mouseEnter(getDateCell(/Thursday, July 16, 2026/));

        expect(getDateCell(/Tuesday, July 7, 2026/)).toHaveClass('bg-brand', 'rounded-l-md');
        expect(getDateCell(/Thursday, July 16, 2026/)).toHaveClass('bg-brand', 'rounded-r-md');
        expect(getDateCell(/Thursday, July 16, 2026/)).not.toHaveAttribute('aria-selected');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps the draft range while navigating across months', async () => {
        const onChange = vi.fn();

        render(<DatePicker.Range placeholder="Pick range" onChange={onChange} />);

        await openPicker('Pick range');
        fireEvent.click(getDateCell(/Thursday, July 30, 2026/));
        fireEvent.click(screen.getAllByRole('button', { name: 'Next month' })[1]);
        fireEvent.click(getDateCell(/Thursday, September 10, 2026/));

        expect(onChange).toHaveBeenCalledWith([expect.any(Date), expect.any(Date)]);
    });

    it('navigates range calendars independently without closing the panel', async () => {
        const onClose = vi.fn();

        render(<DatePicker.Range onClose={onClose} />);

        await openPicker('Start date - End date');
        await waitFor(() => expect(screen.getAllByRole('grid', { name: 'Choose date range' })[0]).toHaveFocus());

        fireEvent.click(screen.getAllByRole('button', { name: 'Next month' })[1]);
        await waitFor(() => expect(screen.getAllByRole('grid', { name: 'Choose date range' })[0]).toHaveFocus());

        expect(screen.getByRole('button', { name: 'July' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'September' })).toBeInTheDocument();

        fireEvent.click(screen.getAllByRole('button', { name: 'Previous month' })[0]);
        await waitFor(() => expect(screen.getAllByRole('grid', { name: 'Choose date range' })[0]).toHaveFocus());

        expect(screen.getByRole('button', { name: 'Start date - End date' })).toHaveAttribute('aria-expanded', 'true');
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'June' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'September' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'July' })).not.toBeInTheDocument();
    });

    it('keeps keyboard navigation visible between non-adjacent range panels', async () => {
        render(<DatePicker.Range defaultValue={[new Date(2026, 6, 1), new Date(2026, 8, 1)]} />);

        await openPicker('2026-07-01 - 2026-09-01');
        let grids = screen.getAllByRole('grid', { name: 'Choose date range' });

        fireEvent.keyDown(grids[0], { key: 'PageDown' });

        grids = screen.getAllByRole('grid', { name: 'Choose date range' });

        expect(screen.getByRole('button', { name: 'August' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'September' })).toBeInTheDocument();
        expect(grids[0]).toHaveAttribute('aria-activedescendant', expect.stringContaining('2026-08-01'));
    });

    it('edits the panel whose header opened the month view', async () => {
        render(<DatePicker.Range defaultValue={[new Date(2026, 6, 7), new Date(2026, 8, 16)]} />);

        await openPicker('2026-07-07 - 2026-09-16');
        fireEvent.click(screen.getByRole('button', { name: 'September' }));

        expect(screen.getByRole('gridcell', { name: 'Sep' })).toHaveAttribute('aria-selected', 'true');

        fireEvent.click(screen.getByRole('gridcell', { name: 'Oct' }));

        expect(screen.getByRole('button', { name: 'July' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'October' })).toBeInTheDocument();
    });

    it('syncs a controlled range update while the panel is open', async () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <DatePicker.Range value={[new Date(2026, 6, 7), new Date(2026, 6, 16)]} onChange={onChange} />,
        );

        await openPicker('2026-07-07 - 2026-07-16');
        fireEvent.click(getDateCell(/Thursday, July 9, 2026/));

        rerender(<DatePicker.Range value={[new Date(2026, 6, 10), new Date(2026, 6, 16)]} onChange={onChange} />);
        fireEvent.click(getDateCell(/Monday, July 20, 2026/));
        fireEvent.click(getDateCell(/Saturday, July 25, 2026/));

        expect(onChange).toHaveBeenCalledWith([expect.any(Date), expect.any(Date)]);
    });

    it('keeps the panel open when switching header views', async () => {
        const onClose = vi.fn();

        render(<DatePicker placeholder="Pick date" onClose={onClose} />);

        await openPicker('Pick date');
        const dayGrid = screen.getByRole('grid', { name: 'Choose date' });
        const monthButton = screen.getByRole('button', { name: 'July' });

        await waitFor(() => expect(dayGrid).toHaveFocus());
        fireEvent.mouseDown(monthButton);
        fireEvent.click(monthButton);

        const monthGrid = screen.getByRole('grid', { name: 'Choose month' });
        const yearButton = screen.getByRole('button', { name: '2026' });

        await waitFor(() => expect(monthGrid).toHaveFocus());
        fireEvent.mouseDown(yearButton);
        fireEvent.click(yearButton);

        await waitFor(() => expect(screen.getByRole('grid', { name: 'Choose year' })).toHaveFocus());
        expect(screen.getByRole('button', { name: 'Pick date' })).toHaveAttribute('aria-expanded', 'true');
        expect(onClose).not.toHaveBeenCalled();
    });

    it('keeps the active range grid as the only aria active descendant owner', async () => {
        render(<DatePicker.Range placeholder="Pick range" />);

        await openPicker('Pick range');

        let grids = screen.getAllByRole('grid', { name: 'Choose date range' });

        expect(grids[0]).toHaveAttribute('tabIndex', '0');
        expect(grids[0]).toHaveAttribute('aria-activedescendant', expect.stringContaining('2026-07-01'));
        expect(grids[1]).toHaveAttribute('tabIndex', '-1');
        expect(grids[1]).not.toHaveAttribute('aria-activedescendant');

        fireEvent.keyDown(grids[0], { key: 'PageDown' });

        grids = screen.getAllByRole('grid', { name: 'Choose date range' });

        expect(grids[0]).toHaveAttribute('tabIndex', '-1');
        expect(grids[0]).not.toHaveAttribute('aria-activedescendant');
        expect(grids[1]).toHaveAttribute('tabIndex', '0');
        expect(grids[1]).toHaveAttribute('aria-activedescendant', expect.stringContaining('2026-08-01'));
    });

    it('clears a range value without opening the panel', () => {
        const onChange = vi.fn();

        render(<DatePicker.Range defaultValue={[new Date(2026, 6, 7), new Date(2026, 6, 16)]} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));

        expect(onChange).toHaveBeenCalledWith(null);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('disables blocked calendar navigation', async () => {
        render(<DatePicker maxDate={new Date(2026, 6, 31)} minDate={new Date(2026, 6, 1)} />);

        await openPicker();

        expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Previous year' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Next year' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'July' }));

        expect(await screen.findByRole('grid', { name: 'Choose month' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '2026' }));

        expect(await screen.findByRole('grid', { name: 'Choose year' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Previous years' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Next years' })).toBeDisabled();
    });

    it('commits function presets at click time', async () => {
        const onChange = vi.fn();

        render(<DatePicker presets={[{ label: 'Today', value: () => new Date(2026, 6, 7) }]} onChange={onChange} />);

        await openPicker();
        fireEvent.click(screen.getByRole('button', { name: 'Today' }));

        expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it('opens from a custom trigger slot and respects prevented key handlers', async () => {
        const wrapperKeyDown = vi.fn(evt => evt.preventDefault());
        const ref = createRef<HTMLElement>();

        render(
            <DatePicker className="default-trigger-only" ref={ref}>
                <DatePicker.Trigger className="custom-trigger" onKeyDown={wrapperKeyDown}>
                    <div>Custom date</div>
                </DatePicker.Trigger>
            </DatePicker>,
        );

        const trigger = screen.getByRole('button', { name: 'Custom date' });

        expect(ref.current).toBe(trigger);
        expect(trigger).toHaveClass('custom-trigger');
        expect(trigger).not.toHaveClass('default-trigger-only');

        fireEvent.keyDown(trigger, { key: 'Enter' });

        expect(wrapperKeyDown).toHaveBeenCalled();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        fireEvent.click(trigger);

        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    });

    it('supports controlled values', async () => {
        const Demo = () => {
            const [value, setValue] = useState<Date | null>(new Date(2026, 6, 7));

            return <DatePicker value={value} onChange={setValue} />;
        };

        render(<Demo />);

        await openPicker('2026-07-07');
        fireEvent.click(getDateCell(/Thursday, July 9, 2026/));

        expect(screen.getByRole('button', { name: '2026-07-09' })).toBeInTheDocument();
    });

    it('returns to the current month when reopened without a value', async () => {
        render(<DatePicker />);

        await openPicker();
        fireEvent.click(screen.getByRole('button', { name: 'Next month' }));

        expect(screen.getByRole('button', { name: 'August' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Select date' }));
        await openPicker();

        expect(screen.getByRole('button', { name: 'July' })).toBeInTheDocument();
    });
});
