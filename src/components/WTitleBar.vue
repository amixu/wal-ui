<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    size?: 'tiny' | 'small' | 'medium' | 'large';
  }>(),
  {
    size: 'large'
  }
);

const sizeObj = {
  tiny: '14px',
  small: '16px',
  medium: '20px',
  large: '24px'
};

const barWidth = computed(() => {
  return (parseInt(sizeObj[props.size]) - 4) / 2 + 'px';
});
</script>

<template>
  <header class="ph">
    <div class="ph__titleWrap">
      <div
        class="ph__specBar"
        aria-hidden="true"
        :style="{ height: sizeObj[size], width: barWidth, borderRadius: barWidth }"
      />
      <div class="ph__titles">
        <div class="ph__title" :style="{ fontSize: sizeObj[size] }">{{ title }}</div>
        <p v-if="subtitle" class="ph__sub text-sub-sm">{{ subtitle }}</p>
      </div>
    </div>

    <div v-if="$slots.actions" class="ph__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.ph {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.ph__titleWrap {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  min-width: 0;
}

.ph__specBar {
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--c-primary) 95%, #ffffff 5%),
    color-mix(in oklab, var(--c-primary) 72%, #000000 28%)
  );
  box-shadow: 0 10px 30px color-mix(in oklab, var(--c-primary) 30%, transparent);
}

.ph__titles {
  min-width: 0;
}

.ph__title {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.1px;
  line-height: 1;
}

.ph__sub {
  margin: var(--space-2xs) 0 0;
}

.ph__actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  justify-content: flex-end;
}
</style>
