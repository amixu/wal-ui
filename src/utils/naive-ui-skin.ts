// naive-ui 皮肤/主题配置集中管理
// 目标：避免每个页面/组件都散落 theme-overrides，后续换肤更方便。

import type { GlobalThemeOverrides } from 'naive-ui';

/** 表单控件与按钮统一圆角（通过主题变量注入，全站生效） */
const controlBorderRadius = '16px';

export const naiveUiThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#0053E2',
    primaryColorHover: '#1A66FF',
    primaryColorPressed: '#0046C2',
    primaryColorSuppl: '#1A66FF',

    infoColor: '#0053E2',
    infoColorHover: '#1A66FF',
    infoColorPressed: '#0046C2',
    infoColorSuppl: '#1A66FF',

    successColor: '#39AF4B',
    successColorHover: '#61C771',
    successColorPressed: '#249C37',
    successColorSuppl: '#61C771',

    warningColor: '#E29100',
    warningColorHover: '#FFC220',
    warningColorPressed: '#BB6602',
    warningColorSuppl: '#FFC220',

    errorColor: '#ED220B',
    errorColorHover: '#F66150',
    errorColorPressed: '#C72A18',
    errorColorSuppl: '#F66150',

    borderRadius: controlBorderRadius,
    borderRadiusSmall: controlBorderRadius,
    fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontFamilyMono:
      "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

    borderColor: 'rgba(28, 35, 51, 0.12)',
    dividerColor: 'rgba(28, 35, 51, 0.12)',
    textColor1: '#1C2333',
    textColor2: 'rgba(28, 35, 51, 0.74)',
    textColor3: 'rgba(28, 35, 51, 0.58)',

    hoverColor: 'rgba(0, 83, 226, 0.08)',
    pressedColor: 'rgba(0, 83, 226, 0.12)'
  },
  Input: {
    borderRadius: controlBorderRadius
  },
  Button: {
    borderRadiusTiny: controlBorderRadius,
    borderRadiusSmall: controlBorderRadius,
    borderRadiusMedium: controlBorderRadius,
    borderRadiusLarge: controlBorderRadius
  },
  Checkbox: {
    borderRadius: '2px'
  },
  InternalSelection: {
    borderRadius: controlBorderRadius
  },
  InternalSelectMenu: {
    borderRadius: controlBorderRadius
  },

  Tooltip: {
    color: '#EAF1FF',
    textColor: '#1C2333',
    boxShadow: '0 14px 34px rgba(28, 35, 51, 0.10), 0 0 0 1px rgba(28, 35, 51, 0.12) inset'
  },

  Tag: {
    borderRadius: '999px',
    fontSizeMedium: '13px',
    closeIconSizeMedium: '13px'
  },

  DataTable: {
    thColor: '#f4f7fc',
    borderRadius: controlBorderRadius
  }
};

export function syncThemeColorsToCssVars() {
  const rootStyle = document.documentElement.style;
  const common = naiveUiThemeOverrides.common;
  if (!common) return;

  const colorMap: Array<[string, unknown]> = [
    ['--c-primary', common.primaryColor],
    ['--c-success', common.successColor],
    ['--c-warning', common.warningColor],
    ['--c-error', common.errorColor]
  ];

  for (const [cssVarName, value] of colorMap) {
    if (typeof value === 'string' && value.trim()) {
      rootStyle.setProperty(cssVarName, value);
    }
  }
}
