<template>
  <div class="brand" aria-label="System branding" :style="{ width: width }">
    <div class="brand__logo" aria-hidden="true">
      <img v-if="logoSrc" :src="logoSrc" alt="" class="brand__logo-image" />
      <template v-else>
        <div class="brand__logo-bg"></div>
        <svg viewBox="0 0 24 24" focusable="false" class="brand__logo-icon">
          <g fill="#FFC220" transform="translate(12 12)">
            <path
              d="M-0.82-3.9Q-1.12-6.9-1.82-10.45Q-1.9-11.02-1.38-11.35Q0-12.05 1.38-11.35Q1.9-11.02 1.82-10.45Q1.12-6.9 0.82-3.9Z"
            />
            <path
              d="M-0.82-3.9Q-1.12-6.9-1.82-10.45Q-1.9-11.02-1.38-11.35Q0-12.05 1.38-11.35Q1.9-11.02 1.82-10.45Q1.12-6.9 0.82-3.9Z"
              transform="rotate(60)"
            />
            <path
              d="M-0.82-3.9Q-1.12-6.9-1.82-10.45Q-1.9-11.02-1.38-11.35Q0-12.05 1.38-11.35Q1.9-11.02 1.82-10.45Q1.12-6.9 0.82-3.9Z"
              transform="rotate(120)"
            />
            <path
              d="M-0.82-3.9Q-1.12-6.9-1.82-10.45Q-1.9-11.02-1.38-11.35Q0-12.05 1.38-11.35Q1.9-11.02 1.82-10.45Q1.12-6.9 0.82-3.9Z"
              transform="rotate(180)"
            />
            <path
              d="M-0.82-3.9Q-1.12-6.9-1.82-10.45Q-1.9-11.02-1.38-11.35Q0-12.05 1.38-11.35Q1.9-11.02 1.82-10.45Q1.12-6.9 0.82-3.9Z"
              transform="rotate(240)"
            />
            <path
              d="M-0.82-3.9Q-1.12-6.9-1.82-10.45Q-1.9-11.02-1.38-11.35Q0-12.05 1.38-11.35Q1.9-11.02 1.82-10.45Q1.12-6.9 0.82-3.9Z"
              transform="rotate(300)"
            />
          </g>
        </svg>
      </template>
    </div>
    <div class="brand__text">
      {{ title }}
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    logoSrc?: string;
    width?: string;
  }>(),
  {
    width: '200px'
  }
);
</script>
<style scoped>
.brand {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  gap: 12px;
}
.brand__logo {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  z-index: 1;
}

.brand__logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.brand__logo-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--c-primary) 0%,
    color-mix(in oklab, var(--c-primary) 70%, #8b5cf6 30%) 100%
  );
  border-radius: inherit;
}

.brand__logo-icon {
  position: relative;
  width: 22px;
  height: 22px;
  fill: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  z-index: 1;
}

.brand__text {
  font-size: 16px;
}
</style>
