<script setup lang="ts">
import WFilterSection from './WFilterSection.vue';
import { useDebouncedWindowSize } from '../composables/useDebouncedWindowSize';
import type { DataTableColumns } from 'naive-ui';
import { NDataTable, NEmpty, NPagination } from 'naive-ui';
import { computed, ref, useAttrs, watch } from 'vue';

defineOptions({
  inheritAttrs: false
});

type RowKeyFn = (row: any) => string | number;
type PagingTablePanelOwnProps = {
  showToolbar?: boolean;
  columns: DataTableColumns<any>;
  data: any[];
  loading?: boolean;
  maxHeight?: number;
  fixedHeight?: number;
  scrollX?: number;
  rowKey?: RowKeyFn;
  emptyDescription?: string;
  page: number;
  itemCount: number;
  pageSize: number;
  pageSizes?: number[];
  filterChips?: string[];
};

const props = withDefaults(defineProps<PagingTablePanelOwnProps>(), {
  showToolbar: true,
  loading: false,
  rowKey: (row: any) => row.id,
  emptyDescription: '没有匹配的数据',
  pageSizes: () => [15, 50, 100, 200],
  filterChips: () => []
});

const displayColumns = ref<DataTableColumns<any>>(props.columns);
const { height: windowHeight } = useDebouncedWindowSize();
const attrs = useAttrs();

const dataTableAttrs = computed(() => {
  const { class: _className, style: _style, id: _id, ...rest } = attrs;
  return rest;
});

const dataTableBind = computed(() => dataTableAttrs.value);

const realScrollX = computed(() => {
  if (props.scrollX) {
    return props.scrollX;
  }
  if ((displayColumns.value as any[]).length > 7) {
    return displayColumns.value.reduce(
      (acc, col: any) =>
        acc +
        (typeof col.width === 'string' ||
        typeof col.minWidth === 'string' ||
        typeof col.maxWidth === 'string'
          ? parseInt(col.width || col.minWidth || col.maxWidth, 10)
          : col.width || col.minWidth || col.maxWidth || 0),
      0
    );
  }
  return 960;
});

const realMaxHeight = computed(() => {
  if (props.fixedHeight) {
    return Math.max(300, windowHeight.value - props.fixedHeight);
  }
  return props.maxHeight;
});

watch(
  () => props.columns,
  next => {
    displayColumns.value = next;
  }
);

defineEmits<{
  (e: 'update:page', value: number): void;
  (e: 'update:pageSize', value: number): void;
}>();
</script>

<template>
  <section class="ui-panel" style="padding: 0">
    <div class="toolbar" v-if="showToolbar">
      <div class="toolbar__left">
        <span v-if="itemCount > 0" class="toolbar__count text-sub-sm">
          共
          <strong>{{ itemCount }}</strong>
          条
        </span>
        <WFilterSection v-if="filterChips.length" :chips="filterChips" />
        <slot name="toolbarLeft" />
      </div>
      <div class="toolbar__right">
        <slot name="toolbarRight" />
      </div>
    </div>
    <div
      class="tableWrap"
      :class="{ tableWrap__toolbar: showToolbar, tableWrap_pager: !!itemCount }"
    >
      <n-data-table
        v-bind="dataTableBind"
        :columns="displayColumns"
        :data="data"
        :loading="loading"
        :bordered="false"
        :max-height="realMaxHeight"
        :scroll-x="realScrollX"
        :row-key="rowKey"
      >
        <template #empty>
          <n-empty :description="emptyDescription" />
        </template>
      </n-data-table>
    </div>

    <footer class="pager" v-if="!!itemCount">
      <n-pagination
        size="small"
        :page="page"
        :item-count="itemCount"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        show-size-picker
        :show-quick-jump-dropdown="false"
        :disabled="loading"
        @update:page="v => $emit('update:page', v)"
        @update:pageSize="v => $emit('update:pageSize', v)"
      />
    </footer>
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  min-height: 56px;
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

.toolbar__count {
  white-space: nowrap;
}

.toolbar__count strong {
  color: var(--c-primary);
  font-weight: 600;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.tableWrap {
  overflow: auto;
}
.tableWrap__toolbar {
  border: 1px solid var(--c-line);
  border-radius: var(--radius-md);
  margin: var(--space-md);
  box-shadow: var(--shadow-1);
}
.tableWrap_pager {
  margin-bottom: var(--space-sm);
}

.pager {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 0 var(--space-sm) var(--space-sm) 0;
}

.tableWrap :deep(.n-data-table-th--fixed-right) .n-data-table-th__title-wrapper {
  padding-left: var(--space-xs) !important;
}

.tableWrap :deep(.n-data-table .n-button) {
  padding: 0 var(--space-xs) !important;
}

.tableWrap :deep(.n-data-table .n-tag) {
  height: 22px;
  padding: 0 var(--space-xs) !important;
  font-size: var(--text-xs) !important;
}
</style>
