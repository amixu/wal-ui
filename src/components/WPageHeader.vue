<template>
  <div :class="['scdb__top', backgroundType]">
    <div class="scdb__top-left">
      <slot name="left" />
    </div>

    <div class="scdb__top-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    backgroundType?: 'light' | 'primary' | 'deep';
  }>(),
  {
    backgroundType: 'light'
  }
);
</script>

<style scoped>
.scdb__top {
  position: sticky;
  top: 0;
  z-index: 4;
  border-bottom: 1px solid var(--c-line);
  height: 59px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0 var(--space-md);

  &.primary,
  &.deep {
    color: white;
  }
  &.primary {
    background: var(--c-primary);
  }
  &.deep {
    background: color-mix(in oklab, #002559 92%, white);
  }
}
.scdb__top-left,
.scdb__top-right {
  display: flex;
  align-items: center;
}

.scdb__top-left {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  margin-right: var(--space-sm);
  gap: var(--space-lg);
}

.scdb__top-right {
  flex: 0 0 auto;
  min-width: 0;
  gap: var(--space-xs);
}
</style>
