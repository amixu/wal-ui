<script setup lang="ts">
import WActionButton from './WActionButton.vue';
import { useDebouncedWindowSize } from '../composables/useDebouncedWindowSize';
import {
  NButton,
  NCascader,
  NCheckbox,
  NCheckboxGroup,
  NDatePicker,
  NInput,
  NInputGroup,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NSelect
} from 'naive-ui';
import { computed, ref } from 'vue';

type CompType =
  | 'NInput'
  | 'NSelect'
  | 'NCascader'
  | 'NDatePicker'
  | 'NInputNumber'
  | 'NRadioGroup'
  | 'NCheckboxGroup'
  | 'NInputGroup';

type QueryField = {
  key: string;
  compType: CompType;
  label?: string;
  /** label 后面的问号提示内容（hover 展示） */
  tipContent?: string | string[];
  required?: boolean;
  requiredMessage?: string;
  params?: Record<string, unknown>;
};

type ChoiceOption = { label: string; value: string | number };

type InputGroupParams = {
  firstKey: string;
  firstWidth?: string;
  firstOptions: ChoiceOption[];
  firstParams?: Record<string, unknown>;
  secondType?: 'NInput' | 'NSelect';
  secondKey?: string;
  secondWidth?: string;
  secondOptions?: ChoiceOption[];
  secondParams?: Record<string, unknown>;
};

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    modelValue: Record<string, unknown>;
    fields: QueryField[];
    columnWidth?: number; //每列最小宽度
    columnNumber?: number; // 一行最多展示的列数
    showNumber?: number; // 折叠状态下显示的条件数量
    defaultExpanded?: boolean;
    showToggle?: boolean;
    searchText?: string;
    resetText?: string;
    expandText?: string;
    collapseText?: string;
  }>(),
  {
    columnWidth: 260,
    columnNumber: 6,
    searchText: '查询',
    resetText: '重置',
    expandText: '更多条件',
    collapseText: '收起条件'
  }
);

const { width } = useDebouncedWindowSize();
const columns = computed(() => calcColumns(width.value - 300)); //屏幕宽度 - 菜单宽度
const realShowNumber = computed(() => props.showNumber || columns.value - 1); // 折叠状态下默认展示的条件数量

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, unknown>): void;
  (e: 'search'): void;
  (e: 'reset'): void;
  (e: 'toggle', expanded: boolean): void;
}>();

const expanded = ref(!props.showToggle || !!props.defaultExpanded);
const fieldErrors = ref<Record<string, string>>({});

function onToggle() {
  expanded.value = !expanded.value;
  emit('toggle', expanded.value);
}

function emitSearch() {
  if (props.loading) return;
  if (!validateRequiredFields()) return;
  emit('search');
}

const baseFields = computed(() => props.fields.filter((_, i) => i < realShowNumber.value));
const visibleFields = computed(() => (expanded.value ? props.fields : baseFields.value));

function patchValue(key: string, value: unknown) {
  if (fieldErrors.value[key]) {
    const nextErrors = { ...fieldErrors.value };
    delete nextErrors[key];
    fieldErrors.value = nextErrors;
  }
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}

function datePickerUsesFormattedValue(f: QueryField) {
  const p = f.params as { valueFormat?: unknown } | undefined;
  return Boolean(p?.valueFormat);
}

function compOf(t: CompType) {
  if (t === 'NCascader') return NCascader;
  if (t === 'NSelect') return NSelect;
  if (t === 'NDatePicker') return NDatePicker;
  if (t === 'NInputNumber') return NInputNumber;
  return NInput;
}

function normalizedParams(field: QueryField) {
  const raw = { ...(field.params ?? {}) };
  if (field.compType === 'NRadioGroup' || field.compType === 'NCheckboxGroup') {
    // 选项由插槽渲染，避免把 options 作为无效属性透传
    delete (raw as { options?: unknown }).options;
  }
  return {
    clearable: true,
    ...raw,
    disabled: props.loading || Boolean(raw.disabled)
  };
}

function choiceOptions(field: QueryField): ChoiceOption[] {
  const raw = (field.params as { options?: unknown } | undefined)?.options;
  if (!Array.isArray(raw)) return [];
  return raw as ChoiceOption[];
}

function calcColumns(width: number) {
  // 每 300px 约一列，并限制在 1~6 列，避免过窄/过宽布局异常
  return Math.max(1, Math.min(props.columnNumber, Math.floor(width / props.columnWidth)));
}

function inputGroupParams(field: QueryField): InputGroupParams {
  const raw = (field.params ?? {}) as Partial<InputGroupParams>;
  const secondType = raw.secondType ?? 'NInput';
  const secondOptions = Array.isArray(raw.secondOptions) ? raw.secondOptions : [];
  return {
    firstWidth: raw.firstWidth ?? '40%',
    firstKey: raw.firstKey ?? `${field.key}Type`,
    firstOptions: Array.isArray(raw.firstOptions) ? raw.firstOptions : [],
    firstParams: { clearable: true, ...(raw.firstParams ?? {}) },
    secondWidth: raw.secondWidth ?? '60%',
    secondType,
    secondKey: raw.secondKey ?? field.key,
    secondOptions,
    secondParams: { clearable: true, ...(raw.secondParams ?? {}) }
  };
}

function isEmptyValue(value: unknown) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function validateRequiredFields() {
  const nextErrors: Record<string, string> = {};
  for (const field of visibleFields.value) {
    if (!field.required) continue;
    if (!isEmptyValue(props.modelValue[field.key])) continue;
    const label = field.label || field.key;
    nextErrors[field.key] = field.requiredMessage || `请输入${label}`;
  }
  fieldErrors.value = nextErrors;
  const firstError = Object.values(nextErrors)[0];
  if (firstError) {
    return false;
  }
  return true;
}
</script>

<template>
  <section class="ui-panel">
    <div class="form" :style="{ '--query-columns': String(columns) }">
      <div v-for="f in visibleFields" :key="f.key" class="field">
        <WTooltipIcon
          v-if="f.label"
          :label="f.label"
          :tip-content="f.tipContent"
          :class="['field__label', 'text-sub-xs', { 'field__label--required': f.required }]"
        >
          <span v-if="fieldErrors[f.key]" class="field__error" role="alert">
            {{ fieldErrors[f.key] }}
          </span>
          <slot :name="f.key" />
        </WTooltipIcon>

        <n-radio-group
          v-if="f.compType === 'NRadioGroup'"
          :value="modelValue[f.key] as any"
          v-bind="normalizedParams(f)"
          :aria-invalid="Boolean(fieldErrors[f.key])"
          :class="{ 'field__control--invalid': fieldErrors[f.key] }"
          @update:value="(v: unknown) => patchValue(f.key, v)"
        >
          <n-radio v-for="opt in choiceOptions(f)" :key="String(opt.value)" :value="opt.value">
            {{ opt.label }}
          </n-radio>
        </n-radio-group>
        <n-checkbox-group
          v-else-if="f.compType === 'NCheckboxGroup'"
          :value="modelValue[f.key] as any"
          v-bind="normalizedParams(f)"
          :aria-invalid="Boolean(fieldErrors[f.key])"
          :class="{ 'field__control--invalid': fieldErrors[f.key] }"
          @update:value="(v: unknown) => patchValue(f.key, v)"
        >
          <n-checkbox v-for="opt in choiceOptions(f)" :key="String(opt.value)" :value="opt.value">
            {{ opt.label }}
          </n-checkbox>
        </n-checkbox-group>
        <n-date-picker
          v-else-if="f.compType === 'NDatePicker' && datePickerUsesFormattedValue(f)"
          :formatted-value="modelValue[f.key] as any"
          v-bind="normalizedParams(f)"
          :aria-invalid="Boolean(fieldErrors[f.key])"
          :class="{ 'field__control--invalid': fieldErrors[f.key] }"
          @update:formatted-value="(v: unknown) => patchValue(f.key, v)"
        />
        <n-input-group
          v-else-if="f.compType === 'NInputGroup'"
          :class="{ 'field__control--invalid': fieldErrors[f.key] }"
        >
          <n-select
            :style="{ width: inputGroupParams(f).firstWidth }"
            :value="modelValue[inputGroupParams(f).firstKey] as any"
            :options="inputGroupParams(f).firstOptions"
            v-bind="inputGroupParams(f).firstParams"
            :aria-invalid="Boolean(fieldErrors[f.key])"
            @update:value="(v: unknown) => patchValue(inputGroupParams(f).firstKey, v)"
          />
          <n-select
            v-if="inputGroupParams(f).secondType === 'NSelect'"
            :style="{ width: inputGroupParams(f).secondWidth }"
            :value="modelValue[inputGroupParams(f).secondKey as string] as any"
            :options="inputGroupParams(f).secondOptions"
            v-bind="inputGroupParams(f).secondParams"
            :aria-invalid="Boolean(fieldErrors[f.key])"
            :class="{ 'field__control--invalid': fieldErrors[f.key] }"
            @update:value="(v: unknown) => patchValue(inputGroupParams(f).secondKey as string, v)"
          />
          <n-input
            v-else
            :style="{ width: inputGroupParams(f).secondWidth }"
            :value="modelValue[inputGroupParams(f).secondKey as string] as any"
            v-bind="inputGroupParams(f).secondParams"
            :aria-invalid="Boolean(fieldErrors[f.key])"
            :class="{ 'field__control--invalid': fieldErrors[f.key] }"
            @update:value="(v: unknown) => patchValue(inputGroupParams(f).secondKey as string, v)"
            @keydown.enter="emitSearch"
          />
        </n-input-group>
        <component
          v-else
          :is="compOf(f.compType)"
          :value="modelValue[f.key] as any"
          v-bind="normalizedParams(f)"
          :aria-invalid="Boolean(fieldErrors[f.key])"
          :class="{ 'field__control--invalid': fieldErrors[f.key] }"
          @update:value="(v: unknown) => patchValue(f.key, v)"
          @keydown.enter="emitSearch"
        />
      </div>

      <div class="form__buttons">
        <WActionButton
          v-if="!!searchText"
          action="search"
          :label="searchText"
          :loading="loading"
          :disabled="loading"
          @click="emitSearch"
        />
        <WActionButton
          v-if="!!resetText"
          action="reset"
          :label="resetText"
          :disabled="loading"
          @click="emit('reset')"
        />
        <n-button v-if="showToggle" text type="primary" size="tiny" @click="onToggle">
          {{ expanded ? collapseText : expandText }}
        </n-button>
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.form {
  display: grid;
  grid-template-columns: repeat(var(--query-columns), minmax(0, 1fr));
  gap: var(--space-sm) var(--space-lg);
  align-items: end;
}

.field {
  display: grid;
  gap: var(--space-2xs);
}

.field__label {
  font-weight: 600;
  letter-spacing: 0.15px;
}

.field__label--required::before {
  content: '*';
  color: var(--c-error);
  margin-right: 4px;
}

.field :deep(.field__control--invalid),
.field :deep(.field__control--invalid .n-input),
.field :deep(.field__control--invalid .n-base-selection),
.field :deep(.field__control--invalid .n-input-wrapper) {
  border-color: var(--c-error) !important;
}

.field__error {
  color: var(--c-error);
  margin-left: var(--space-xs);
}

.form__buttons {
  display: flex;
  gap: var(--space-xs);
  justify-content: flex-end;
  /* 固定落在最右列：当前行有空位则同排，否则自动换到下一行 */
  grid-column: -2 / -1;
  justify-self: end;
}
</style>
