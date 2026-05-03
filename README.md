# wal-ui

基于 **Vue 3**、**Naive UI** 的业务组件库，使用方式与 Naive UI 类似：支持全量 `app.use()`，也支持按需引入单个组件。

## 依赖（peer）

应用项目需自行安装：

- `vue` ^3.3
- `naive-ui` ^2.38
- `vue-router` ^4.2
- `@iconify/vue` ^4 / ^5
- `axios` ^1.6

日历组件依赖的 `chinese-workday`、`solarlunar` 已作为 **wal-ui 的 dependencies** 打入包内，无需在业务中重复安装。

## 安装

```bash
npm install wal-ui
```

## 全量注册（类似 `app.use(naive)`）

```ts
import { createApp } from 'vue';
import naive from 'naive-ui';
import walUi from 'wal-ui';
import 'naive-ui/dist/style.css';
import 'wal-ui/style.css';

const app = createApp(App);
app.use(naive);
app.use(walUi);
```

## 按需引入

```ts
import { WLayout, WPageHeader } from 'wal-ui';
import 'wal-ui/style.css';
```

## 工具函数与 composables

```ts
import { httpRequest, listToMenuTree, useVisitedTags } from 'wal-ui';
```

## 本地构建

```bash
npm install
npm run build
```

产物在 `dist/`：`index.js`、`index.cjs`、`index.d.ts`、`wal-ui.css`。

## 发布到 npm

```bash
npm login
npm publish --access public
```

首次发布前请在 [npm](https://www.npmjs.com/) 确认包名 `wal-ui` 未被占用，或把 `package.json` 里的 `name` 改成你的作用域包名（例如 `@amixu/wal-ui`）。
