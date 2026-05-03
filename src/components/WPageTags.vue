<script setup lang="ts">
import { findMenuLabelChain, resolveActiveMenuPath } from '../composables/useMenuRouting';
import { useVisitedTags } from '../composables/useVisitedTags';
import type { MenuNodeType } from '../utils';
import { Icon } from '@iconify/vue';
import type { DropdownOption } from 'naive-ui';
import { NButton, NDropdown, NTag } from 'naive-ui';
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const props = defineProps<{
  menuOptions: MenuNodeType[];
  onDark?: boolean;
}>();

const iconNavColor = computed(() => (props.onDark ? 'white' : 'var(--c-text-2)'));

function getCurrentMenuPath() {
  return resolveActiveMenuPath(props.menuOptions, route.path, route.hash);
}

function getCurrentMenuLabel(path: string) {
  if (!path) return '';
  const result = findMenuLabelChain(props.menuOptions, path);
  return result?.[result.length - 1] || path;
}

const { visitedTags, activeTagKey, closeTag, closeOthers, closeRight, selectTag, addCurrentTag } =
  useVisitedTags({
    route,
    router,
    resolveCurrentPath: getCurrentMenuPath,
    resolveLabel: getCurrentMenuLabel
  });

watch(
  () => props.menuOptions,
  () => addCurrentTag(),
  { deep: true }
);

const menuX = ref(0);
const menuY = ref(0);
const menuTagKey = ref('');
const showMenu = ref(false);
const scrollContainerRef = ref<HTMLElement | null>(null);
const canScrollPrev = ref(false);
const canScrollNext = ref(false);
const hasOverflow = ref(false);

const contextMenuOptions: DropdownOption[] = [
  {
    label: '关闭其他',
    key: 'closeOthers'
  },
  {
    label: '关闭右侧',
    key: 'closeRight'
  }
];

function handleClose(key: string) {
  closeTag(key);
}

function handleContextMenu(event: MouseEvent, key: string) {
  event.preventDefault();
  menuTagKey.value = key;
  menuX.value = event.clientX;
  menuY.value = event.clientY;
  showMenu.value = true;
}

function handleDropdownSelect(action: string) {
  if (!menuTagKey.value) return;
  if (action === 'closeOthers') {
    closeOthers(menuTagKey.value);
  } else if (action === 'closeRight') {
    closeRight(menuTagKey.value);
  }
  showMenu.value = false;
}

function hideMenu() {
  showMenu.value = false;
}

function handleSelect(key: string) {
  selectTag(key);
}

function updateScrollState() {
  const el = scrollContainerRef.value;
  if (!el) {
    canScrollPrev.value = false;
    canScrollNext.value = false;
    hasOverflow.value = false;
    return;
  }

  hasOverflow.value = el.scrollWidth > el.clientWidth + 1;
  canScrollPrev.value = el.scrollLeft > 0;
  canScrollNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

function scrollTags(direction: 'prev' | 'next') {
  const el = scrollContainerRef.value;
  if (!el) return;

  const distance = Math.max(120, Math.floor(el.clientWidth * 0.6));
  el.scrollBy({
    left: direction === 'prev' ? -distance : distance,
    behavior: 'smooth'
  });
}

function ensureActiveTagVisible(key: string) {
  const container = scrollContainerRef.value;
  if (!container) return;

  const safeKey = String(key).replace(/"/g, '\\"');
  const tagEl = container.querySelector<HTMLElement>(`[data-tag-key="${safeKey}"]`);
  if (!tagEl) return;

  const left = tagEl.offsetLeft;
  const right = left + tagEl.offsetWidth;
  const viewLeft = container.scrollLeft;
  const viewRight = viewLeft + container.clientWidth;
  const padding = 12;

  if (left < viewLeft + padding) {
    container.scrollTo({ left: Math.max(0, left - padding), behavior: 'smooth' });
  } else if (right > viewRight - padding) {
    container.scrollTo({
      left: Math.max(0, right - container.clientWidth + padding),
      behavior: 'smooth'
    });
  }
}

watch(
  () => visitedTags.value.map(tag => tag.key).join('|'),
  async () => {
    await nextTick();
    updateScrollState();
  },
  { immediate: true }
);

watch(
  () => activeTagKey.value,
  async key => {
    if (!key) return;
    await nextTick();
    ensureActiveTagVisible(key);
    updateScrollState();
  }
);
</script>

<template>
  <div class="pagetagsWrap" v-if="visitedTags.length">
    <NButton
      v-if="hasOverflow"
      quaternary
      circle
      class="pagetagsNav"
      :disabled="!canScrollPrev"
      aria-label="向前查看标签"
      @click="scrollTags('prev')"
    >
      <Icon
        icon="ri:arrow-left-s-line"
        aria-hidden="true"
        :color="iconNavColor"
        style="font-size: 20px"
      />
    </NButton>

    <div ref="scrollContainerRef" class="pagetags" @scroll="updateScrollState">
      <NTag
        v-for="tag in visitedTags"
        :key="tag.key"
        :data-tag-key="tag.key"
        :type="!onDark && tag.key === activeTagKey ? 'primary' : 'default'"
        :bordered="false"
        :class="[
          'pagetag',
          { 'pagetag--active': tag.key === activeTagKey, 'pagetag--on-dark': onDark }
        ]"
        :closable="visitedTags.length > 1"
        @click="handleSelect(tag.key)"
        @close="handleClose(tag.key)"
        @contextmenu="handleContextMenu($event, tag.key)"
      >
        {{ tag.label }}
      </NTag>
    </div>

    <NButton
      v-if="hasOverflow"
      quaternary
      circle
      class="pagetagsNav"
      :disabled="!canScrollNext"
      aria-label="向后查看标签"
      @click="scrollTags('next')"
    >
      <Icon
        icon="ri:arrow-right-s-line"
        aria-hidden="true"
        :color="iconNavColor"
        style="font-size: 20px"
      />
    </NButton>

    <NDropdown
      trigger="manual"
      :show="showMenu"
      :x="menuX"
      :y="menuY"
      :options="contextMenuOptions"
      @select="handleDropdownSelect"
      @clickoutside="hideMenu"
    />
  </div>
</template>

<style scoped>
.pagetagsWrap {
  width: 0;
  min-width: 0;
  max-width: 100%;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  overflow: hidden;
}

.pagetags {
  width: 0;
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none;
}

.pagetags::-webkit-scrollbar {
  display: none;
}

.pagetagsNav {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  color: var(--c-text-2);
}

.pagetag {
  flex: 0 0 auto;
  cursor: pointer;
  max-width: 180px;
}

.pagetag :deep(.n-tag__content) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagetag:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--c-primary) 72%, white 28%);
  outline-offset: 2px;
}

.pagetag--on-dark {
  color: rgba(255, 255, 255, 0.95) !important;
  background: rgba(255, 255, 255, 0.2) !important;
}

.pagetag--on-dark.pagetag--active {
  color: color-mix(in oklab, var(--c-primary) 86%, black 14%) !important;
  background: rgba(255, 255, 255, 0.95) !important;
}

.pagetag :deep(.n-tag__close) {
  color: currentColor !important;
  opacity: 0.8;
}
</style>
