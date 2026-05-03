<script setup lang="ts">
import { findAncestorKeys, resolveActiveMenuPath } from '../composables/useMenuRouting';
import type { MenuNodeType } from '../utils';
import { NMenu } from 'naive-ui';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  menuOptions: MenuNodeType[];
}>();

const router = useRouter();
const route = useRoute();
const expandedKeys = ref<string[]>([]);

const activeMenuKey = computed(
  () => resolveActiveMenuPath(props.menuOptions, route.path, route.hash) || route.path
);

watch(
  [activeMenuKey, () => props.menuOptions],
  ([path]) => {
    expandedKeys.value = findAncestorKeys(props.menuOptions, String(path));
  },
  { immediate: true }
);

function go(p: string) {
  void router.push(p);
}

function updateExpandedKeys(keys: string[]) {
  expandedKeys.value = [...keys];
}
</script>

<template>
  <n-menu
    :options="props.menuOptions"
    :value="activeMenuKey"
    :expanded-keys="expandedKeys"
    :icon-size="14"
    :indent="28"
    :root-indent="20"
    mode="vertical"
    @update:expanded-keys="updateExpandedKeys"
    @update:value="v => go(String(v))"
  />
</template>
<style scoped>
:deep(.n-menu-item-content__icon) {
  margin-right: var(--space-2xs) !important;
}
</style>
