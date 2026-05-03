<script setup lang="ts">
/**
 * 全局空状态组件
 * 用于列表/表格无数据时的友好提示
 */

withDefaults(
  defineProps<{
    /** 空状态图标类型 */
    type?: 'data' | 'search' | 'file' | 'network' | 'inbox';
    /** 标题文本 */
    title?: string;
    /** 描述文本 */
    description?: string;
    /** 是否显示插图 */
    showIllustration?: boolean;
    /** 自定义高度 */
    minHeight?: string;
  }>(),
  {
    type: 'data',
    title: '暂无数据',
    description: '',
    showIllustration: true,
    minHeight: '240px'
  }
);

defineSlots<{
  /** 操作按钮区域 */
  actions?: () => unknown;
  /** 自定义描述 */
  description?: () => unknown;
}>();
</script>

<template>
  <div class="empty-state" :style="{ minHeight }">
    <!-- 装饰背景 -->
    <div class="empty-state__bg" aria-hidden="true">
      <div class="empty-state__circle"></div>
    </div>

    <!-- 插图 -->
    <div v-if="showIllustration" class="empty-state__illustration" aria-hidden="true">
      <!-- 数据空状态 -->
      <svg
        v-if="type === 'data'"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="20"
          y="30"
          width="80"
          height="50"
          rx="8"
          fill="var(--c-surface-2)"
          stroke="var(--c-line)"
          stroke-width="2"
        />
        <rect x="30" y="42" width="25" height="6" rx="3" fill="var(--c-line)" />
        <rect x="30" y="52" width="40" height="6" rx="3" fill="var(--c-line)" opacity="0.7" />
        <rect x="30" y="62" width="30" height="6" rx="3" fill="var(--c-line)" opacity="0.5" />
        <circle
          cx="85"
          cy="55"
          r="18"
          fill="var(--c-primary-soft)"
          stroke="var(--c-primary)"
          stroke-width="2"
          stroke-dasharray="4 4"
        />
        <path
          d="M78 55h14M85 48v14"
          stroke="var(--c-primary)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>

      <!-- 搜索无结果 -->
      <svg
        v-else-if="type === 'search'"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="45"
          r="28"
          fill="var(--c-surface-2)"
          stroke="var(--c-line)"
          stroke-width="2"
        />
        <path d="M72 72l18 18" stroke="var(--c-line)" stroke-width="4" stroke-linecap="round" />
        <path
          d="M40 45h20M50 35v20"
          stroke="var(--c-text-3)"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.6"
        />
        <circle
          cx="88"
          cy="32"
          r="12"
          fill="var(--c-primary-soft)"
          stroke="var(--c-primary)"
          stroke-width="2"
        />
        <path
          d="M85 32l3 3 5-5"
          stroke="var(--c-primary)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <!-- 文件空状态 -->
      <svg
        v-else-if="type === 'file'"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 25h50l20 20v40a6 6 0 0 1-6 6H31a6 6 0 0 1-6-6V31a6 6 0 0 1 6-6z"
          fill="var(--c-surface-2)"
          stroke="var(--c-line)"
          stroke-width="2"
        />
        <path d="M75 25v20h20" stroke="var(--c-line)" stroke-width="2" />
        <rect x="40" y="55" width="40" height="4" rx="2" fill="var(--c-line)" opacity="0.5" />
        <rect x="40" y="63" width="30" height="4" rx="2" fill="var(--c-line)" opacity="0.3" />
      </svg>

      <!-- 网络错误 -->
      <svg
        v-else-if="type === 'network'"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="60"
          cy="45"
          r="30"
          fill="var(--c-surface-2)"
          stroke="var(--c-line)"
          stroke-width="2"
        />
        <path
          d="M45 60c0-8.284 6.716-15 15-15s15 6.716 15 15"
          stroke="var(--c-text-3)"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.5"
        />
        <circle cx="60" cy="60" r="4" fill="var(--c-primary)" />
        <path d="M35 70h50" stroke="var(--c-line)" stroke-width="2" stroke-linecap="round" />
        <circle
          cx="35"
          cy="70"
          r="3"
          fill="var(--c-primary-soft)"
          stroke="var(--c-primary)"
          stroke-width="2"
        />
        <circle
          cx="85"
          cy="70"
          r="3"
          fill="var(--c-primary-soft)"
          stroke="var(--c-primary)"
          stroke-width="2"
        />
      </svg>

      <!-- 默认收件箱空状态 -->
      <svg v-else viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 35h80v40a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6V35z"
          fill="var(--c-surface-2)"
          stroke="var(--c-line)"
          stroke-width="2"
        />
        <path
          d="M20 35l40 25 40-25"
          stroke="var(--c-line)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M40 45v15M80 45v15"
          stroke="var(--c-text-3)"
          stroke-width="2"
          stroke-linecap="round"
          opacity="0.4"
        />
        <circle
          cx="60"
          cy="28"
          r="10"
          fill="var(--c-primary-soft)"
          stroke="var(--c-primary)"
          stroke-width="2"
        />
        <path
          d="M56 28h8M60 24v8"
          stroke="var(--c-primary)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- 文本内容 -->
    <div class="empty-state__content">
      <h3 class="empty-state__title">{{ title }}</h3>
      <p v-if="description || $slots.description" class="empty-state__description text-sub-sm">
        <slot name="description">{{ description }}</slot>
      </p>
      <div v-if="$slots.actions" class="empty-state__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
}

.empty-state__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.empty-state__circle {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in oklab, var(--c-primary) 8%, transparent) 0%,
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(40px);
}

.empty-state__illustration {
  width: 120px;
  height: 100px;
  margin-bottom: 20px;
  opacity: 0.9;
  animation: float-gentle 4s ease-in-out infinite;
}

@keyframes float-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.empty-state__illustration svg {
  width: 100%;
  height: 100%;
}

.empty-state__content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.empty-state__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text-2);
}

.empty-state__description {
  margin: 0 0 16px;
  max-width: 280px;
  line-height: 1.5;
}

.empty-state__actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
