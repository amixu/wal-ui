<script setup lang="ts">
import { formatDateTime, type DateCellMeta } from '../utils';
import { getFestival, isAdditionalWorkday, isHoliday } from 'chinese-workday';
import { NConfigProvider } from 'naive-ui';
import solarLunar from 'solarlunar';
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: number | undefined;
    placeholder?: string;
    cellMetaByKey?: Record<string, DateCellMeta>;
    cnHolidayMarks?: boolean;
    clearable?: boolean;
  }>(),
  {
    placeholder: '请选择日期',
    cellMetaByKey: () => ({}),
    cnHolidayMarks: true,
    clearable: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void;
}>();

const popoverShow = ref(false);

const dateValue = computed({
  get: () => props.modelValue,
  set: (value: number | undefined) => emit('update:modelValue', value)
});

const displayValue = computed(() => {
  if (!dateValue.value) return '';
  return formatDateTime(dateValue.value, 'date');
});

function toKey(year: number, month: number, date: number) {
  const realMonth = month >= 1 && month <= 12 ? month : month + 1;
  return `${year}-${String(realMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
}

function prevKeyOf(key: string) {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return formatDateTime(d, 'date');
}

function cnDefaultMetaForCell(key: string): DateCellMeta | undefined {
  if (!props.cnHolidayMarks) return undefined;

  // chinese-workday 数据覆盖有限年份；超出范围直接不标记
  try {
    if (isAdditionalWorkday(key)) {
      return {
        cornerText: '班',
        borderColor: 'var(--c-success)',
        cornerBg: 'var(--c-success)'
      };
    }
    if (isHoliday(key)) {
      // 普通周末不标“假”，只有被官方假期连休纳入的周末才标“假”
      const festival = getFestival(key);
      if (festival === '周末') return undefined;

      // 只在“节日第一天”显示 bottomText（如国庆节只标注 10/1）
      const prevKey = prevKeyOf(key);
      const isFestivalFirstDay = !(isHoliday(prevKey) && getFestival(prevKey) === festival);

      return {
        cornerText: '休',
        borderColor: 'var(--c-error)',
        cornerBg: 'var(--c-error)',
        ...(isFestivalFirstDay
          ? {
              bottomText: festival,
              bottomColor: 'var(--c-error)'
            }
          : {})
      };
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function metaForCell(year: number, month: number, date: number): DateCellMeta | undefined {
  const key = toKey(year, month, date);
  // 外部传入优先（可覆盖默认“假/班”）
  return props.cellMetaByKey[key] ?? cnDefaultMetaForCell(key);
}

type Solar2LunarResult = -1 | { dayCn?: string };

function lunarDayForCell(year: number, month: number, date: number) {
  const res = solarLunar.solar2lunar(year, month, date) as Solar2LunarResult;
  if (res === -1) return '-';
  return res.dayCn ?? '-';
}

const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

function onPick() {
  popoverShow.value = false;
}
</script>

<template>
  <n-popover v-model:show="popoverShow" trigger="click" placement="bottom-start">
    <template #trigger>
      <n-input
        :value="displayValue"
        readonly
        :placeholder="placeholder"
        :clearable="clearable"
        @clear="dateValue = undefined"
      />
    </template>

    <NConfigProvider>
      <n-calendar
        :style="{ height: '420px', width: '460px' }"
        v-model:value="dateValue"
        :is-date-disabled="() => false"
        @update:value="onPick"
      >
        <template #header="{ year, month }">
          <div class="calendarHeaderCustom">
            <div class="calendarHeaderCustom__month">{{ year }}年{{ month }}月</div>
            <div class="calendarHeaderCustom__weekdays">
              <div v-for="w in weekdays" :key="w" class="calendarHeaderCustom__weekday">
                {{ w }}
              </div>
            </div>
          </div>
        </template>

        <template #default="{ year, month, date }">
          <div
            class="cellMark"
            :style="{
              borderColor: metaForCell(year, month, date)?.borderColor,
              backgroundColor: metaForCell(year, month, date)?.bgColor
            }"
          >
            <div
              class="cellMark__corner"
              v-if="metaForCell(year, month, date)?.cornerText"
              :style="{ backgroundColor: metaForCell(year, month, date)?.cornerBg }"
            >
              {{ metaForCell(year, month, date)?.cornerText }}
            </div>

            <div
              class="cellMark__bottom"
              :style="{
                color: metaForCell(year, month, date)?.bottomColor ?? 'var(--c-text-3)'
              }"
            >
              {{ metaForCell(year, month, date)?.bottomText ?? lunarDayForCell(year, month, date) }}
            </div>
          </div>
        </template>
      </n-calendar>
    </NConfigProvider>
  </n-popover>
</template>

<style scoped>
.cellMark {
  position: absolute;
  inset: 2px 2px 4px 2px;
  border-radius: 4px;
  border: 1px solid transparent;
  pointer-events: none;
  z-index: 0;
}

.cellMark__corner {
  position: absolute;
  top: 2px;
  right: 2px;
  padding: 3px;
  border-radius: 999px;
  font-size: 10px;
  color: #fff;
  line-height: 1;
}

.cellMark__bottom {
  position: absolute;
  bottom: 3px;
  left: 0;
  right: 0;
  font-size: 10px;
  line-height: 1.1;
  text-align: center;
}

.calendarHeaderCustom {
  width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding-top: 12px;
}

.calendarHeaderCustom__month {
  font-weight: 800;
  font-size: 16px;
}

.calendarHeaderCustom__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  width: 100%;
  font-size: 14px;
  line-height: 1;
  color: var(--c-text-2);
}

.calendarHeaderCustom__weekday {
  text-align: center;
}

:deep(.n-calendar .n-calendar-header) {
  padding-bottom: 8px !important;
  position: relative;
}

:deep(.n-calendar .n-calendar-header .n-calendar-header__extra) {
  position: absolute;
  top: 4px;
  right: 0;
}

:deep(.n-calendar .n-calendar-cell .n-calendar-date) {
  margin-top: 16% !important;
  font-size: 16px !important;
}

:deep(.n-calendar-date__day) {
  display: none !important;
}

:deep(.n-calendar-date) {
  justify-content: center !important;
  padding-bottom: 0 !important;
}

:deep(.n-calendar-date__date) {
  margin-left: 0 !important;
}
</style>
