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
    backgroundType?: 'light' | 'primary' | 'darkBlue' | 'black';
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
  &.darkBlue,
  &.black {
    color: white;
  }
  &.primary {
    background: linear-gradient(
      180deg,
      color-mix(in oklab, var(--c-primary) 92%, white) 0%,
      color-mix(in oklab, var(--c-primary) 78%, black) 100%
    );
  }
  &.darkBlue {
    background: linear-gradient(
      180deg,
      color-mix(in oklab, #002559 92%, white) 0%,
      color-mix(in oklab, #002559 78%, black) 100%
    );
  }
  &.black {
    background: linear-gradient(180deg, #293247 0%, #1c2333 100%);
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
