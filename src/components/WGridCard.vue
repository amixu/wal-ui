<script setup lang="ts">
type GridCardItem = {
  [key: string]: unknown;
};

const props = withDefaults(
  defineProps<{
    cardList: GridCardItem[];
    toKey?: string;
    keyField?: string;
    cardWidth?: string;
    borderStyle?: 'solid' | 'dashed';
  }>(),
  {
    toKey: 'path',
    keyField: 'path',
    cardWidth: '240px',
    borderStyle: 'solid'
  }
);
</script>

<template>
  <div
    class="grid"
    :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}, 1fr))` }"
  >
    <router-link
      v-for="(item, index) in props.cardList"
      :key="String(item[props.keyField] ?? index)"
      :to="String(item[props.toKey] ?? '')"
      class="card"
      :style="{ cursor: item[props.toKey] ? 'pointer' : 'default', borderStyle: props.borderStyle }"
    >
      <slot :item="item" :index="index" />
    </router-link>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--space-sm);
}

.card {
  display: grid;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  background: var(--c-bg);
  text-decoration: none;
  color: inherit;
  transition: 120ms ease;
}

.card:hover {
  border-color: color-mix(in oklab, var(--c-primary) 40%, var(--c-line) 60%);
  box-shadow: var(--shadow-1);
  transform: translateY(-1px);
}
</style>
