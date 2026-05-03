import { onMounted, onUnmounted, ref } from 'vue';

export function useDebouncedWindowSize(delay = 300) {
  const width = ref(top?.innerWidth ?? window.innerWidth);
  const height = ref(top?.innerHeight ?? window.innerHeight);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const update = () => {
    width.value = top?.innerWidth ?? window.innerWidth;
    height.value = top?.innerHeight ?? window.innerHeight;
    timer = null;
  };

  const onResize = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(update, delay);
  };

  onMounted(() => {
    window.addEventListener('resize', onResize, { passive: true });
  });

  onUnmounted(() => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    window.removeEventListener('resize', onResize);
  });

  return { width, height };
}
