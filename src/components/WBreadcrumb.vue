<script setup lang="ts">
import {
  findMenuLabelChain,
  normalizeHashPath,
  resolveActiveMenuPath
} from '../composables/useMenuRouting';
import type { MenuNodeType } from '../utils';
import { Icon } from '@iconify/vue';
import { NButton } from 'naive-ui';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  menuOptions: MenuNodeType[];
  onDark?: boolean;
}>();

const route = useRoute();
const router = useRouter();

function goBack() {
  router.back();
}

const breadcrumbs = computed(() => {
  const hashPath = normalizeHashPath(route.hash);
  const currentMenuPath = resolveActiveMenuPath(props.menuOptions, route.path, route.hash);
  const result = findMenuLabelChain(props.menuOptions, currentMenuPath);
  if (hashPath) {
    result?.push('成员');
  }
  return result;
});
</script>

<template>
  <div :class="['crumbsWrap', onDark ? 'on-dark' : 'default']">
    <NButton quaternary class="crumbs__back" aria-label="返回上一步" @click="goBack">
      <Icon icon="ri:arrow-left-s-line" aria-hidden="true" />
    </NButton>
    <nav class="crumbs" aria-label="面包屑">
      <template v-for="(label, idx) in breadcrumbs" :key="idx">
        <span aria-hidden="true" v-if="idx > 0">/</span>
        <span>
          {{ label }}
        </span>
      </template>
    </nav>
  </div>
</template>

<style scoped>
.crumbsWrap {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
  &.default {
    color: var(--c-text-2);
  }
  &.on-dark {
    color: white;
    .crumbs__back {
      background: color-mix(in oklab, white 85%, transparent);
      border: 1px solid var(--c-line);
    }
  }
}

.crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2xs);
}

.crumbs__back {
  border: 1px solid var(--c-line-strong);
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.crumbs__back:hover {
  color: var(--c-primary);
  border-color: color-mix(in oklab, var(--c-primary) 46%, var(--c-line) 54%);
  background: color-mix(in oklab, var(--c-primary) 14%, transparent);
}

.crumbs__back:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--c-primary) 72%, white 28%);
  outline-offset: 2px;
}
</style>
