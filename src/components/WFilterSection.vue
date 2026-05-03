<script setup lang="ts">
import { NTag } from 'naive-ui';

withDefaults(
  defineProps<{
    chips: string[];
    label?: string;
  }>(),
  {
    label: '筛选'
  }
);
</script>

<template>
  <div v-if="chips.length > 0" class="fs__chips" :aria-label="`已生效${label}条件`">
    <span class="fs__label text-sub-xs">{{ label }}</span>
    <n-tag v-for="(c, idx) in chips" :key="idx" type="primary" size="small" round>
      {{ c }}
    </n-tag>
  </div>
</template>

<style scoped>
.fs__chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.fs__label {
  border: 1px dashed color-mix(in oklab, var(--c-text) 18%, transparent);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-pill);
}
</style>
