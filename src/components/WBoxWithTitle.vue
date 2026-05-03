<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'default' | 'large';
  }>(),
  {
    disabledColumnKeys: () => [],
    size: 'default'
  }
);

const titleStyle = computed(() => {
  return {
    height: props.size === 'default' ? '44px' : '56px'
  };
});
</script>

<template>
  <section class="ui-panel" style="padding: 0">
    <div class="toolbar" :style="titleStyle">
      <div class="toolbar__left">
        <slot name="titleLeft" />
      </div>
      <div class="toolbar__right">
        <slot name="titleRight" />
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  padding: 0 var(--space-md);
  background: linear-gradient(180deg, var(--c-surface) 0%, var(--c-surface-2) 100%);
  border-bottom: 1px solid var(--c-line);
}

.toolbar__left {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  min-width: 0;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.content {
  overflow: auto;
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  margin: var(--space-md);
  box-shadow: var(--shadow-1);
}
</style>
