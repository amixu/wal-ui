<template>
  <div v-if="layoutMode === 'x'" class="layout-wrap layout-wrap--x">
    <aside
      class="layout-wrap__left"
      :style="{ minWidth: sideWidth }"
      aria-label="Workbench navigation"
    >
      <div class="logo">
        <slot name="logo" />
      </div>
      <div class="nav">
        <slot name="side" />
      </div>
    </aside>

    <div class="layout-wrap__right">
      <slot name="header" />
      <main class="content" role="main">
        <slot />
      </main>
    </div>
  </div>

  <div v-else class="layout-wrap layout-wrap--y">
    <slot name="header" />
    <div class="layout-wrap__content">
      <aside
        class="layout-wrap__left"
        :style="{ minWidth: sideWidth }"
        aria-label="Workbench navigation"
      >
        <div class="nav">
          <slot name="side" />
        </div>
      </aside>

      <div class="layout-wrap__right">
        <main class="content" role="main">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  layoutMode: {
    type: String as PropType<'x' | 'y'>,
    default: 'x',
    validator: (v: string) => v === 'x' || v === 'y'
  },
  sideWidth: {
    type: [String, Number] as PropType<string | number>,
    default: '220px'
  }
});

const layoutMode = props.layoutMode;
const sideWidth = props.sideWidth;
</script>

<style scoped>
.layout-wrap {
  width: 100%;
  height: 100vh;

  display: flex;
  overflow: hidden;
  color: var(--c-text);
}

.layout-wrap--x {
  flex-direction: row;
}

.layout-wrap--y {
  flex-direction: column;
  background: var(--c-bg);
}

.layout-wrap__left {
  flex: 0 0 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  max-width: 280px;
  border-right: 1px solid var(--c-line);
}

.layout-wrap__left > .logo {
  padding: 12px 0 12px 20px;
  box-sizing: border-box;
}

.layout-wrap__left > .nav {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 10px 0;
}

.layout-wrap__right {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.layout-wrap__right > .content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
  background: var(--c-bg);
}

.layout-wrap__content {
  display: flex;
  width: 100%;
  flex: 1 1 0;
  min-height: 0;
}
</style>
