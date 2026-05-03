<script setup lang="ts">
import type { PopoverPlacement } from 'naive-ui';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string | undefined;
    tipContent?: string | string[];
    tipUseSlot?: boolean;
    iconText?: '?' | '!';
    labelColorType?: 'default' | 'primary' | 'warning' | 'error';
    iconColorType?: 'default' | 'primary' | 'warning' | 'error';
    width?: string;
    placement?: PopoverPlacement;
  }>(),
  { width: '460px', iconText: '?', labelColorType: 'default', iconColorType: 'default' }
);

const tipContentArr = computed(() => {
  if (typeof props.tipContent === 'string') return props.tipContent.split('\n');
  return props.tipContent;
});
</script>

<template>
  <span class="label-with-help">
    <span :class="labelColorType">{{ label }}</span>
    <NTooltip
      v-if="tipUseSlot || !!tipContent"
      trigger="hover"
      :style="{ maxWidth: width }"
      :placement="placement"
    >
      <template #trigger>
        <span :class="['field__label-tip', iconColorType]">{{ iconText }}</span>
      </template>
      <slot name="tip" v-if="!tipContent" />
      <div v-else v-for="(line, i) in tipContentArr" :key="i">{{ line }}</div>
    </NTooltip>
    <slot />
  </span>
</template>

<style scoped>
.label-with-help {
  display: inline-flex;
  align-items: center;
}

.field__label-tip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  margin-left: var(--space-2xs);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  cursor: help;
  user-select: none;
}

.field__label-tip.default {
  border: 1px solid color-mix(in srgb, var(--c-text-3) 55%, transparent);
  color: var(--c-text-3);
}

.field__label-tip.primary {
  border: 1px solid color-mix(in srgb, var(--c-primary) 55%, transparent);
  background-color: color-mix(in srgb, var(--c-primary) 15%, transparent);
}

.field__label-tip.warning {
  border: 1px solid color-mix(in srgb, var(--c-warning) 55%, transparent);
  background-color: color-mix(in srgb, var(--c-warning) 15%, transparent);
}

.field__label-tip.error {
  border: 1px solid color-mix(in srgb, var(--c-error) 55%, transparent);
  background-color: color-mix(in srgb, var(--c-error) 15%, transparent);
}

.field__label-tip.default:hover {
  color: var(--c-primary);
  border-color: color-mix(in srgb, var(--c-primary) 55%, transparent);
}

.primary {
  color: var(--c-primary);
}
.warning {
  color: var(--c-warning);
}
.error {
  color: var(--c-error);
}
</style>
