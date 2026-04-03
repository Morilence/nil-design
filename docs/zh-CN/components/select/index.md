---
title: Select 选择器
cat: 输入
---

# {{ $frontmatter.title }}

用于从一组选项中进行单选或多选。

## 变体
::: react-live
```tsx
import { Select } from '@nild/components';

const Demo = () => {
  return (
    <div className="flex flex-col items-start gap-4">
      <Select placeholder="Outlined (default)" variant="outlined" style={{ width: 220 }}>
        <Select.Option value="beijing" label="Beijing" />
        <Select.Option value="shanghai" label="Shanghai" />
      </Select>
      <Select placeholder="Filled" variant="filled" style={{ width: 220 }}>
        <Select.Option value="beijing" label="Beijing" />
        <Select.Option value="shanghai" label="Shanghai" />
      </Select>
    </div>
  );
};

render(<Demo />);
```
:::

## 尺寸
::: react-live
```tsx
import { Select } from '@nild/components';

const Demo = () => {
  return (
    <div className="flex flex-col items-start gap-4">
      <Select size="small" placeholder="Small" style={{ width: 220 }}>
        <Select.Option value="beijing" label="Beijing" />
        <Select.Option value="shanghai" label="Shanghai" />
      </Select>
      <Select size="medium" placeholder="Medium" style={{ width: 220 }}>
        <Select.Option value="beijing" label="Beijing" />
        <Select.Option value="shanghai" label="Shanghai" />
      </Select>
      <Select size="large" placeholder="Large" style={{ width: 220 }}>
        <Select.Option value="beijing" label="Beijing" />
        <Select.Option value="shanghai" label="Shanghai" />
      </Select>
    </div>
  );
};

render(<Demo />);
```
:::

## 基础单选
::: react-live
```tsx
import { Select } from '@nild/components';

const Demo = () => {
  return (
    <div className="flex flex-col items-start gap-4">
      <Select placeholder="请选择城市" style={{ width: 240 }}>
        <Select.Option value="beijing" label="北京">
          北京 / Beijing
        </Select.Option>
        <Select.Option value="shanghai" label="上海">
          上海 / Shanghai
        </Select.Option>
        <Select.Option value="shenzhen" label="深圳">
          深圳 / Shenzhen
        </Select.Option>
      </Select>
    </div>
  );
};

render(<Demo />);
```
:::

## 基础多选
::: react-live
```tsx
import { Select } from '@nild/components';

const Demo = () => {
  return (
    <div className="flex flex-col items-start gap-4">
      <Select multiple defaultValue={['css', 'react']} placeholder="请选择技术栈" style={{ width: 280 }}>
        <Select.Option value="html" label="HTML" />
        <Select.Option value="css" label="CSS" />
        <Select.Option value="react" label="React" />
        <Select.Option value="vite" label="Vite" />
      </Select>
    </div>
  );
};

render(<Demo />);
```
:::

## 禁用状态
::: react-live
```tsx
import { Select } from '@nild/components';

const Demo = () => {
  return (
    <div className="flex flex-col items-start gap-4">
      <Select disabled placeholder="整个选择器已禁用" style={{ width: 240 }}>
        <Select.Option value="beijing" label="北京" />
        <Select.Option value="shanghai" label="上海" />
      </Select>
      <Select placeholder="包含禁用选项" style={{ width: 240 }}>
        <Select.Option value="beijing" label="北京" />
        <Select.Option value="shanghai" disabled label="上海（暂不可选）" />
        <Select.Option value="shenzhen" label="深圳" />
      </Select>
    </div>
  );
};

render(<Demo />);
```
:::

## API

<!--@include: ../../../../packages/components/src/select/API.zh-CN.md-->
