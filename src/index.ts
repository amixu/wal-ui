import type { App, Component, Plugin } from 'vue';

import WActionButton from './components/WActionButton.vue';
import WBoxWithTitle from './components/WBoxWithTitle.vue';
import WBreadcrumb from './components/WBreadcrumb.vue';
import WColumnSettings from './components/WColumnSettings.vue';
import WCommonModal from './components/WCommonModal.vue';
import WDateCalendar from './components/WDateCalendar.vue';
import WEmptyState from './components/WEmptyState.vue';
import WFilterSection from './components/WFilterSection.vue';
import WGridCard from './components/WGridCard.vue';
import WLayout from './components/WLayout.vue';
import WLogoTitle from './components/WLogoTitle.vue';
import WPageHeader from './components/WPageHeader.vue';
import WPageTags from './components/WPageTags.vue';
import WSearchPanel from './components/WSearchPanel.vue';
import WSelectLabelValue from './components/WSelectLabelValue.vue';
import WSideMenu from './components/WSideMenu.vue';
import WTablePaging from './components/WTablePaging.vue';
import WTitleBar from './components/WTitleBar.vue';
import WTooltipIcon from './components/WTooltipIcon.vue';
import WUserInfo from './components/WUserInfo.vue';

const INSTALL_LIST: readonly [string, Component][] = [
  ['WActionButton', WActionButton],
  ['WBoxWithTitle', WBoxWithTitle],
  ['WBreadcrumb', WBreadcrumb],
  ['WColumnSettings', WColumnSettings],
  ['WCommonModal', WCommonModal],
  ['WDateCalendar', WDateCalendar],
  ['WEmptyState', WEmptyState],
  ['WFilterSection', WFilterSection],
  ['WGridCard', WGridCard],
  ['WLayout', WLayout],
  ['WLogoTitle', WLogoTitle],
  ['WPageHeader', WPageHeader],
  ['WPageTags', WPageTags],
  ['WSearchPanel', WSearchPanel],
  ['WSelectLabelValue', WSelectLabelValue],
  ['WSideMenu', WSideMenu],
  ['WTablePaging', WTablePaging],
  ['WTitleBar', WTitleBar],
  ['WTooltipIcon', WTooltipIcon],
  ['WUserInfo', WUserInfo]
];

/**
 * 全量注册 Wal UI 组件（用法类似 `app.use(naive)`）。
 */
const walUi: Plugin = {
  install(app: App) {
    for (const [name, comp] of INSTALL_LIST) {
      app.component(name, comp);
    }
  }
};

export default walUi;
export { walUi };

export {
  WActionButton,
  WBoxWithTitle,
  WBreadcrumb,
  WColumnSettings,
  WCommonModal,
  WDateCalendar,
  WEmptyState,
  WFilterSection,
  WGridCard,
  WLayout,
  WLogoTitle,
  WPageHeader,
  WPageTags,
  WSearchPanel,
  WSelectLabelValue,
  WSideMenu,
  WTablePaging,
  WTitleBar,
  WTooltipIcon,
  WUserInfo
};

export * from './utils';
export { useDebouncedWindowSize } from './composables/useDebouncedWindowSize';
export * from './composables/useMenuRouting';
export { useVisitedTags } from './composables/useVisitedTags';
