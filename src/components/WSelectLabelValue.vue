<script setup lang="ts">
import type { SelectOption } from 'naive-ui';
import { h, useAttrs } from 'vue';

const props = withDefaults(
  defineProps<{
    value?: string | number | null;
    options: SelectOption[];
    placeholder?: string;
    clearable?: boolean;
    filterable?: boolean;
  }>(),
  {
    value: null,
    placeholder: '请选择',
    clearable: true,
    filterable: true
  }
);

const emit = defineEmits<{
  (e: 'update:value', value: string | number | null): void;
}>();

const attrs = useAttrs();

function getOption(input: unknown): SelectOption {
  return (input as SelectOption) ?? {};
}

function renderLabelValue(option: SelectOption) {
  const label = String(option.label ?? '');
  const value = String(option.value ?? '');
  return h(
    'div',
    {
      style: {
        width: '100%',
        flex: '1 1 100%',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center'
      }
    },
    [
      h(
        'span',
        {
          style: {
            flex: '1 1 auto',
            minWidth: 0,
            color: '#111827',
            fontWeight: 500
          }
        },
        label
      ),
      h(
        'span',
        {
          style: {
            flex: '0 0 120px',
            color: '#6b7280',
            fontSize: '12px',
            textAlign: 'right'
          }
        },
        value
      )
    ]
  );
}

function renderOption(info: any): any {
  const option = getOption(info?.option ?? info);
  const node = info?.node as any;
  const content = renderLabelValue(option);
  if (!node) return content;
  const baseProps = node?.props ?? {};
  return h(
    'div',
    {
      ...baseProps,
      style: {
        ...(baseProps.style ?? {}),
        width: '100%'
      }
    },
    [content]
  );
}

function renderLabel(option: SelectOption): any {
  return renderLabelValue(getOption(option));
}

function filterLabelAndValue(pattern: string, option: SelectOption): boolean {
  const keyword = pattern.trim().toLowerCase();
  if (!keyword) return true;
  const label = String(option.label ?? '').toLowerCase();
  const value = String(option.value ?? '').toLowerCase();
  return label.includes(keyword) || value.includes(keyword);
}
</script>

<template>
  <n-select
    v-bind="attrs"
    :value="props.value"
    :options="props.options"
    :clearable="props.clearable"
    :filterable="props.filterable"
    :render-option="renderOption"
    :render-label="renderLabel"
    :filter="filterLabelAndValue"
    :placeholder="props.placeholder"
    @update:value="emit('update:value', $event)"
  />
</template>
