<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { NButton, NPopover } from 'naive-ui';

defineProps<{
  userName: string;
  userRole?: string | undefined;
}>();

const emit = defineEmits<{
  logout: [];
}>();

function handleLogout() {
  emit('logout');
}
</script>

<template>
  <NPopover trigger="hover" placement="bottom-end">
    <template #trigger>
      <NButton quaternary circle class="user-menu__trigger" aria-label="用户菜单">
        <Icon icon="ri:user-3-line" aria-hidden="true" />
      </NButton>
    </template>
    <div class="ui-panel" role="menu" aria-label="用户信息">
      <div class="user-menu__name">{{ userName }}</div>
      <div class="user-menu__role" v-if="!!userRole">{{ userRole }}</div>
      <NButton quaternary block size="small" class="user-menu__logout" @click="handleLogout">
        <Icon icon="ri:logout-box-r-line" aria-hidden="true" />
        <span>退出登录</span>
      </NButton>
    </div>
  </NPopover>
</template>

<style scoped>
.user-menu__trigger {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--c-primary) 24%, var(--c-line) 76%);
  color: var(--c-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: var(--space-xs);
  background: white;
}

.user-menu__trigger:hover {
  background-color: white;
}

.user-menu__trigger:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--c-primary) 72%, white 28%);
  outline-offset: 2px;
}

.user-menu__name {
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.3;
}

.user-menu__role {
  font-size: var(--text-xs);
}

.user-menu__logout {
  width: 100%;
  border: 1px solid color-mix(in oklab, var(--c-primary) 18%, var(--c-line) 82%);
  background: color-mix(in oklab, var(--c-primary) 5%, white 95%);
  border-radius: 8px;
  font-size: var(--text-xs);
  gap: 6px;
  margin-top: var(--space-xs);
}

.user-menu__logout:hover {
  border-color: color-mix(in oklab, var(--c-primary) 34%, var(--c-line) 66%);
  background: color-mix(in oklab, var(--c-primary) 10%, white 90%);
}
</style>
