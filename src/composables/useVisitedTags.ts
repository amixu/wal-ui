import { computed, ref, watch } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

type VisitedTag = {
  key: string;
  label: string;
};

type UseVisitedTagsParams = {
  route: RouteLocationNormalizedLoaded;
  router: Router;
  resolveCurrentPath: () => string;
  resolveLabel: (path: string) => string;
};

export function useVisitedTags(params: UseVisitedTagsParams) {
  const { route, router, resolveCurrentPath, resolveLabel } = params;
  const visitedTags = ref<VisitedTag[]>([]);
  const activeTagKey = computed(() => resolveCurrentPath());

  function addCurrentTag() {
    const path = resolveCurrentPath();
    if (!path || visitedTags.value.some(tag => tag.key === path)) return;
    visitedTags.value.push({
      key: path,
      label: resolveLabel(path)
    });
  }

  function closeTag(key: string) {
    if (visitedTags.value.length <= 1) return;
    const index = visitedTags.value.findIndex(tag => tag.key === key);
    if (index < 0) return;
    const isActive = activeTagKey.value === key;
    visitedTags.value.splice(index, 1);
    if (!isActive) return;
    const fallback = visitedTags.value[index] || visitedTags.value[index - 1];
    if (fallback) void router.push(fallback.key);
  }

  function closeOthers(anchorKey: string) {
    const current = visitedTags.value.find(tag => tag.key === anchorKey);
    if (!current) return;
    visitedTags.value = [current];
    if (activeTagKey.value !== anchorKey) void router.push(anchorKey);
  }

  function closeRight(anchorKey: string) {
    const index = visitedTags.value.findIndex(tag => tag.key === anchorKey);
    if (index < 0 || index >= visitedTags.value.length - 1) return;
    const removed = visitedTags.value.slice(index + 1);
    visitedTags.value = visitedTags.value.slice(0, index + 1);
    if (removed.some(tag => tag.key === activeTagKey.value)) void router.push(anchorKey);
  }

  function selectTag(key: string) {
    if (!key || key === route.path) return;
    void router.push(key);
  }

  watch(
    () => [route.path, route.hash],
    () => addCurrentTag(),
    { immediate: true }
  );

  return {
    visitedTags,
    activeTagKey,
    addCurrentTag,
    closeTag,
    closeOthers,
    closeRight,
    selectTag
  };
}
