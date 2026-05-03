<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { ButtonType } from 'naive-ui';
import { NButton } from 'naive-ui';
import { computed, useAttrs } from 'vue';
import type { ActionButtonType } from '../utils';

const props = withDefaults(
  defineProps<{
    action: ActionButtonType;
    label?: string;
    type?: ButtonType;
  }>(),
  {
    label: ''
  }
);
const attrs = useAttrs();

const defaultLabelMap: Record<ActionButtonType, string> = {
  prev: '上一步',
  next: '下一步',
  search: '查询',
  reset: '重置',
  add: '新增',
  edit: '修改',
  del: '删除',
  upload: '上传',
  download: '下载',
  setting: '设置',
  enable: '启用',
  disable: '禁用',
  submit: '提交',
  online: '上线',
  offline: '下线',
  cancel: '取消',
  save: '保存',
  refresh: '刷新',
  confirm: '确定'
};

const iconMap = {
  prev: 'ri:arrow-left-line',
  next: 'ri:arrow-right-line',
  search: 'ri:search-line',
  reset: 'ri:restart-line',
  add: 'ri:add-line',
  edit: 'ri:edit-line',
  del: 'ri:delete-bin-line',
  upload: 'ri:upload-2-line',
  download: 'ri:download-2-line',
  setting: 'ri:settings-3-line',
  enable: 'ri:checkbox-circle-line',
  disable: 'ri:close-circle-line',
  submit: 'ri:arrow-right-line',
  online: 'ri:cloud-line',
  offline: 'ri:cloud-off-line',
  cancel: 'ri:close-line',
  save: 'ri:save-line',
  refresh: 'ri:refresh-line',
  confirm: 'ri:check-line'
} as const;

const buttonTypeMap: Record<ActionButtonType, ButtonType | undefined> = {
  prev: undefined,
  next: 'primary',
  search: 'primary',
  reset: undefined,
  add: 'primary',
  edit: 'primary',
  del: 'error',
  upload: undefined,
  download: undefined,
  setting: undefined,
  enable: 'success',
  disable: 'warning',
  submit: 'primary',
  online: 'success',
  offline: 'warning',
  cancel: undefined,
  save: 'primary',
  refresh: 'primary',
  confirm: 'primary'
};

const text = computed(() => props.label || defaultLabelMap[props.action]);
const icon = computed(() => iconMap[props.action]);
const buttonType = computed(() => props.type ?? buttonTypeMap[props.action]);
</script>

<template>
  <NButton v-bind="attrs" :type="buttonType">
    <template #icon>
      <Icon :icon="icon" aria-hidden="true" />
    </template>
    {{ text }}
  </NButton>
</template>
