---
title: DatePicker 日期选择器
cat: 输入
---

# {{ $frontmatter.title }}

用于在表单、筛选器和报表参数中选择日期或日期范围。

## 变体

::: react-live

```tsx
import { DatePicker } from '@nild/components';

const Demo = () => {
    return (
        <div className="flex flex-col items-start gap-4">
            <DatePicker className="w-56" defaultValue={new Date(2026, 0, 1)} portalClassName="vp-raw" />
            <DatePicker
                className="w-56"
                defaultValue={new Date(2026, 0, 1)}
                variant="filled"
                portalClassName="vp-raw"
            />
            <DatePicker
                className="w-56"
                defaultValue={new Date(2026, 0, 1)}
                variant="underlined"
                portalClassName="vp-raw"
            />
        </div>
    );
};

render(<Demo />);
```

:::

## 尺寸

::: react-live

```tsx
import { DatePicker } from '@nild/components';

const Demo = () => {
    return (
        <div className="flex items-center gap-3">
            <DatePicker size="small" defaultValue={new Date(2026, 0, 1)} portalClassName="vp-raw" />
            <DatePicker size="medium" defaultValue={new Date(2026, 0, 1)} portalClassName="vp-raw" />
            <DatePicker size="large" defaultValue={new Date(2026, 0, 1)} portalClassName="vp-raw" />
        </div>
    );
};

render(<Demo />);
```

:::

## 禁用状态

::: react-live

```tsx
import { DatePicker } from '@nild/components';

const Demo = () => {
    return <DatePicker className="w-60" disabled placeholder="Disabled" portalClassName="vp-raw" />;
};

render(<Demo />);
```

:::

## 只读

只读状态允许打开和浏览面板，但不能修改或清空当前值。

::: react-live

```tsx
import { DatePicker } from '@nild/components';

const Demo = () => {
    return <DatePicker readonly defaultValue={new Date(2026, 6, 7)} portalClassName="vp-raw" />;
};

render(<Demo />);
```

:::

## 范围选择

范围组件通过 `DatePicker.Range` 使用；其公开属性类型为 `DateRangePickerProps`。

::: react-live

```tsx
import { DatePicker } from '@nild/components';

const Demo = () => {
    return (
        <DatePicker.Range
            className="w-72"
            defaultValue={[new Date(2026, 6, 7), new Date(2026, 6, 16)]}
            portalClassName="vp-raw"
        />
    );
};

render(<Demo />);
```

:::

## 约束

::: react-live

```tsx
import { DatePicker } from '@nild/components';

const Demo = () => {
    return (
        <DatePicker
            className="w-60"
            defaultValue={new Date(2026, 6, 7)}
            isDateDisabled={date => date.getDay() === 0 || date.getDay() === 6}
            maxDate={new Date(2026, 6, 31)}
            minDate={new Date(2026, 6, 1)}
            placeholder="选择工作日"
            portalClassName="vp-raw"
        />
    );
};

render(<Demo />);
```

:::

## 预设

::: react-live

```tsx
import { DatePicker } from '@nild/components';

const Demo = () => {
    return (
        <DatePicker.Range
            className="w-72"
            portalClassName="vp-raw"
            presets={[
                {
                    label: '7 月第一周',
                    value: () => [new Date(2026, 6, 1), new Date(2026, 6, 7)],
                },
                {
                    label: '7 月第二周',
                    value: () => [new Date(2026, 6, 8), new Date(2026, 6, 14)],
                },
            ]}
        />
    );
};

render(<Demo />);
```

:::

## 自定义触发器

::: react-live

```tsx
import { Button, DatePicker } from '@nild/components';

const Demo = () => {
    return (
        <DatePicker defaultValue={new Date(2026, 6, 7)} portalClassName="vp-raw">
            <DatePicker.Trigger>
                <Button variant="outlined">选择日期</Button>
            </DatePicker.Trigger>
        </DatePicker>
    );
};

render(<Demo />);
```

:::

## API

<!--@include: ../../../../packages/components/src/date-picker/API.zh-CN.md-->
