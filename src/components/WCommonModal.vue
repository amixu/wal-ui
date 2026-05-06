<script setup lang="ts">
import { NModal } from 'naive-ui';
import type { ActionButtonType } from '../utils';
import WActionButton from './WActionButton.vue';

const _props = withDefaults(
  defineProps<{
    show: boolean;
    title: string;
    loading?: boolean;
    okAction?: ActionButtonType | null;
    cancelAction?: ActionButtonType | null;
    disableOk?: boolean;
    modalWidth?: string;
    contentHeight?: string;
    contentPadding?: string;
  }>(),
  {
    loading: false,
    okAction: 'submit',
    cancelAction: 'cancel',
    disableOk: false,
    modalWidth: 'min(800px, 90vw)',
    contentHeight: 'min(400px, 90vh)',
    contentPadding: '30px 20px 10px 20px'
  }
);

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'ok'): void;
  (e: 'cancel'): void;
}>();

function onCancel() {
  emit('cancel');
  emit('update:show', false);
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="title"
    :content-style="{ padding: 0 }"
    :mask-closable="false"
    :segmented="{ content: true, action: true }"
    :style="{ width: modalWidth }"
    @update:show="v => emit('update:show', v)"
  >
    <template #default>
      <div :style="{ maxHeight: contentHeight, padding: contentPadding, overflow: 'auto' }">
        <slot />
      </div>
    </template>

    <template #action>
      <div class="actions">
        <slot name="action" />
        <WActionButton
          v-if="!!cancelAction"
          :action="cancelAction"
          :disabled="loading"
          @click="onCancel"
        />
        <WActionButton
          v-if="!!okAction"
          :action="okAction"
          :loading="loading"
          :disabled="disableOk || loading"
          @click="emit('ok')"
        />
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}
</style>
