<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NCheckbox, NPopover } from 'naive-ui';
import { computed, ref, watch } from 'vue';

type ColumnKey = string | number;
type ColumnItem = {
  key: ColumnKey;
  title: string;
  locked: boolean;
  hideDisabled: boolean;
  trigger?: 'click' | 'hover';
};

const props = withDefaults(
  defineProps<{
    columns: DataTableColumns<any>;
    disabledColumnKeys?: ColumnKey[];
    storageKey?: string;
  }>(),
  {
    disabledColumnKeys: () => [],
    storageKey: '',
    trigger: 'hover'
  }
);

const emit = defineEmits<{
  (e: 'update:columns', value: DataTableColumns<any>): void;
}>();

const orderedColumnKeys = ref<ColumnKey[]>([]);
const hiddenColumnKeys = ref<ColumnKey[]>([]);

function isFixedPositionColumn(col: any) {
  return col?.fixed === 'left' || col?.fixed === 'right';
}

const sourceColumnsByKey = computed(() => {
  const map = new Map<ColumnKey, any>();
  for (const col of props.columns as any[]) {
    if (col && (typeof col.key === 'string' || typeof col.key === 'number')) {
      map.set(col.key as ColumnKey, col);
    }
  }
  return map;
});

const fixedColumnKeys = computed<ColumnKey[]>(() =>
  Array.from(sourceColumnsByKey.value.values())
    .filter((col: any) => isFixedPositionColumn(col))
    .map((col: any) => col.key as ColumnKey)
);

const nonMovableColumnKeys = computed<ColumnKey[]>(() => {
  // “锁定”仅用于控制顺序不可调整：固定列不可移动
  return fixedColumnKeys.value;
});

const nonHideableColumnKeys = computed<ColumnKey[]>(() => {
  // 固定列允许隐藏；只有显式禁用的列才不可隐藏
  const set = new Set<ColumnKey>([...props.disabledColumnKeys]);
  return Array.from(set);
});

const nonHideableColumnKeySet = computed(() => new Set<ColumnKey>(nonHideableColumnKeys.value));

const configurableColumns = computed<ColumnItem[]>(() => {
  const lockedSet = new Set(nonMovableColumnKeys.value);
  const hideDisabledSet = new Set(nonHideableColumnKeys.value);
  return Array.from(sourceColumnsByKey.value.values()).map((col: any) => ({
    key: col.key as ColumnKey,
    title: typeof col.title === 'string' ? col.title : String(col.key),
    locked: lockedSet.has(col.key as ColumnKey),
    hideDisabled: hideDisabledSet.has(col.key as ColumnKey)
  }));
});

const sortedViewColumns = computed(() => {
  const map = new Map(configurableColumns.value.map(x => [x.key, x]));
  return orderedColumnKeys.value.map(key => map.get(key)).filter(Boolean) as ColumnItem[];
});

const displayColumns = computed<DataTableColumns<any>>(() => {
  const hiddenColumnKeySet = new Set(hiddenColumnKeys.value);
  const forceVisibleColumnKeySet = nonHideableColumnKeySet.value;
  const orderedColumns = orderedColumnKeys.value
    .map(key => sourceColumnsByKey.value.get(key))
    .filter(Boolean)
    .filter(
      (col: any) =>
        !hiddenColumnKeySet.has(col.key as ColumnKey) ||
        forceVisibleColumnKeySet.has(col.key as ColumnKey)
    );
  const unkeyed = (props.columns as any[]).filter(
    col => !(typeof col?.key === 'string' || typeof col?.key === 'number')
  );
  return [...orderedColumns, ...unkeyed];
});

function syncConfigState() {
  const currentColumnKeys = configurableColumns.value.map(x => x.key);
  if (!orderedColumnKeys.value.length) {
    orderedColumnKeys.value = [...currentColumnKeys];
  }
  const currentColumnKeySet = new Set(currentColumnKeys);
  const retainedKeys = orderedColumnKeys.value.filter(k => currentColumnKeySet.has(k));
  const appendedKeys = currentColumnKeys.filter(k => !retainedKeys.includes(k));
  orderedColumnKeys.value = normalizeOrderWithLocked(
    [...retainedKeys, ...appendedKeys],
    currentColumnKeys
  );
  hiddenColumnKeys.value = hiddenColumnKeys.value.filter(
    k => currentColumnKeySet.has(k) && !nonHideableColumnKeys.value.includes(k)
  );
}

function normalizeOrderWithLocked(order: ColumnKey[], baseOrder: ColumnKey[]) {
  const lockedSet = new Set(nonMovableColumnKeys.value);
  const unlockedOrder = order.filter(k => !lockedSet.has(k));
  const result: ColumnKey[] = [];
  let unlockedIdx = 0;
  for (const baseKey of baseOrder) {
    if (lockedSet.has(baseKey)) {
      result.push(baseKey);
      continue;
    }
    const next = unlockedOrder[unlockedIdx++];
    if (next !== undefined) result.push(next);
  }
  return result;
}

function saveConfigToStorage() {
  if (!props.storageKey) return;
  localStorage.setItem(
    props.storageKey,
    JSON.stringify({
      order: orderedColumnKeys.value,
      hidden: hiddenColumnKeys.value
    })
  );
}

function loadConfigFromStorage() {
  if (!props.storageKey) return;
  const raw = localStorage.getItem(props.storageKey);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { order?: ColumnKey[]; hidden?: ColumnKey[] };
    orderedColumnKeys.value = Array.isArray(parsed.order) ? parsed.order : [];
    hiddenColumnKeys.value = Array.isArray(parsed.hidden) ? parsed.hidden : [];
  } catch {
    orderedColumnKeys.value = [];
    hiddenColumnKeys.value = [];
  }
}

function isColumnVisible(key: ColumnKey) {
  return !hiddenColumnKeys.value.includes(key) || nonHideableColumnKeySet.value.has(key);
}

function toggleColumnVisibility(key: ColumnKey, checked: boolean) {
  if (nonHideableColumnKeySet.value.has(key)) return;
  if (checked) {
    hiddenColumnKeys.value = hiddenColumnKeys.value.filter(x => x !== key);
    return;
  }
  if (!hiddenColumnKeys.value.includes(key)) {
    hiddenColumnKeys.value = [...hiddenColumnKeys.value, key];
  }
}

function moveColumn(index: number, direction: -1 | 1) {
  const next = index + direction;
  if (index < 0 || next < 0 || next >= orderedColumnKeys.value.length) return;
  const key = orderedColumnKeys.value[index];
  const target = orderedColumnKeys.value[next];
  const lockedSet = new Set(nonMovableColumnKeys.value);
  if (lockedSet.has(key) || lockedSet.has(target)) return;
  orderedColumnKeys.value[index] = target;
  orderedColumnKeys.value[next] = key;
  orderedColumnKeys.value = [...orderedColumnKeys.value];
}

function resetColumns() {
  orderedColumnKeys.value = configurableColumns.value.map(x => x.key);
  hiddenColumnKeys.value = [];
}

loadConfigFromStorage();
watch([configurableColumns, nonMovableColumnKeys, nonHideableColumnKeys], syncConfigState, {
  immediate: true
});
watch([orderedColumnKeys, hiddenColumnKeys], saveConfigToStorage, { deep: true });
// 避免在组件初始化/渲染阶段同步向父组件回写，导致父组件递归更新
watch(displayColumns, value => emit('update:columns', value), { flush: 'post', immediate: true });
</script>

<template>
  <n-popover trigger="hover" placement="bottom-end">
    <template #trigger>
      <n-button
        type="primary"
        tertiary
        circle
        aria-label="表字段设置"
        title="表字段设置"
        class="colSettingTrigger"
      >
        <Icon icon="ri:settings-3-line" aria-hidden="true" />
      </n-button>
    </template>
    <div class="ui-panel columnSettingPanel">
      <div class="columnSettingHeader">
        <div>
          <div class="columnSettingTitle">字段展示</div>
          <p class="columnSettingHint text-sub-xs">拖动顺序由上下移动控制，固定列不可调整</p>
        </div>
        <n-button size="tiny" text type="primary" @click="resetColumns">重置</n-button>
      </div>
      <div v-if="sortedViewColumns.length" class="columnSettingList">
        <div
          v-for="(item, index) in sortedViewColumns"
          :key="String(item.key)"
          class="columnSettingItem"
        >
          <div class="columnSettingLeft">
            <n-checkbox
              :disabled="item.hideDisabled"
              :checked="isColumnVisible(item.key)"
              @update:checked="checked => toggleColumnVisibility(item.key, checked)"
            >
              {{ item.title }}
            </n-checkbox>
            <span v-if="item.locked" class="flag flag--locked">fixed</span>
            <!-- <span v-else-if="item.hideDisabled" class="flag flag--disabled">disabled</span> -->
          </div>
          <div class="columnSettingActions">
            <n-button
              size="tiny"
              text
              :disabled="item.locked || index === 0 || sortedViewColumns[index - 1]?.locked"
              @click="moveColumn(index, -1)"
            >
              上移
            </n-button>
            <n-button
              size="tiny"
              text
              :disabled="
                item.locked ||
                index === sortedViewColumns.length - 1 ||
                sortedViewColumns[index + 1]?.locked
              "
              @click="moveColumn(index, 1)"
            >
              下移
            </n-button>
          </div>
        </div>
      </div>
      <div v-else class="text-sub-xs">暂无可配置字段</div>
    </div>
  </n-popover>
</template>

<style scoped>
.colSettingTrigger :deep(svg) {
  width: 18px;
  height: 18px;
  fill: currentColor;
  opacity: 0.92;
}

.columnSettingPanel {
  width: 320px;
  padding-right: 0 !important;
}

.columnSettingHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xs);
  padding-right: var(--space-sm);
  gap: var(--space-xs);
}

.columnSettingTitle {
  font-size: var(--text-sm);
  font-weight: 700;
}

.columnSettingHint {
  margin: 3px 0 0;
}

.columnSettingList {
  max-height: 280px;
  overflow: auto;
  padding-right: var(--space-sm);
}

.columnSettingItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) 0;
  gap: var(--space-xs);
  border-bottom: 1px dashed var(--c-primary-soft);
}

.columnSettingItem:last-child {
  border-bottom: none;
}

.columnSettingLeft {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  min-width: 0;
}

.columnSettingActions {
  display: flex;
  gap: var(--space-2xs);
}

.flag {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-pill);
  padding: 1px var(--space-xs);
  font-size: 11px;
  font-weight: 600;
}

.flag--locked {
  color: color-mix(in oklab, var(--c-primary) 72%, black);
  background: color-mix(in oklab, var(--c-primary) 20%, transparent);
}

.flag--disabled {
  color: color-mix(in oklab, var(--c-text) 74%, black);
  background: color-mix(in oklab, var(--c-text) 12%, transparent);
}
</style>
