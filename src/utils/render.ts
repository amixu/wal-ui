import { Icon } from '@iconify/vue';
import { NButton, NDropdown, NSpace, NTag, type ButtonType, type DropdownOption } from 'naive-ui';
import { h } from 'vue';

type StatusTagType =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | true
  | false;

interface TableAction<T> {
  label: string;
  type?: ButtonType;
  onClick: (row: T) => void;
}

/**
 * 创建可复用的图标渲染函数。
 *
 * 主要职责：
 * - 将 Iconify 图标名封装为标准 render 函数
 * - 适配 Naive UI 菜单、按钮等需要函数式图标渲染的场景
 *
 * 参数说明：
 * - `icon`：Iconify 图标名称（如 `ri:layout-4-line`）
 *
 * 返回值：
 * - `() => VNode`：调用后返回 `Icon` 组件节点
 */
export function renderIcon(icon: string) {
  return () => h(Icon, { icon, 'aria-hidden': 'true' });
}

/**
 * 创建表格状态标签的渲染节点。
 *
 * 主要职责：
 * - 统一生成 `NTag` 节点，避免表格列内重复编写渲染代码
 * - 兼容布尔值状态映射：`true -> success`、`false -> error`
 * - 在未传类型时使用默认样式 `default`
 *
 * 参数说明：
 * - `label`：标签文本
 * - `type`：标签类型
 *   - 传 `boolean`：自动映射为 `success/error`
 *   - 传 `StatusTagType`：直接作为 `NTag` 的 `type`
 *
 * 返回值：
 * - `VNode`：可直接用于 Naive UI 表格列 `render`
 */
export function renderTableTag(label: string, type?: StatusTagType) {
  return h(
    NTag,
    {
      bordered: false,
      type: typeof type === 'boolean' ? (type ? 'success' : 'error') : type || 'default'
    },
    {
      default: () => label
    }
  );
}

/**
 * 创建表格行操作区（按钮 + 更多下拉）的渲染节点。
 *
 * 主要职责：
 * - 根据操作数量决定直接展示或折叠展示策略
 * - 操作数量较少时，全部渲染为按钮
 * - 操作数量超阈值时，仅展示前 N-1 个按钮，剩余操作收纳到 `...` 下拉菜单
 *
 * 参数说明：
 * - `row`：当前行数据，点击任一操作时会透传给对应 `onClick`
 * - `actions`：操作配置列表（文案、按钮类型、点击回调）
 * - `showAllWhenCountLe`：折叠阈值，默认 `3`
 *
 * 返回值：
 * - `VNode[]`：可直接用于表格列 `render` 的操作区节点数组
 *
 * 注意事项：
 * - 下拉菜单项使用 `label-index` 作为 key；若存在重复文案也能稳定映射到原始操作
 */
export function renderTableButtons<T>(row: T, actions: TableAction<T>[], showAllWhenCountLe = 3) {
  if (actions.length <= showAllWhenCountLe) {
    return actions.map(action =>
      h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          type: action.type ?? 'default',
          onClick: () => action.onClick(row)
        },
        {
          default: () => action.label
        }
      )
    );
  }

  const visibleActions = actions.slice(0, showAllWhenCountLe - 1);
  const hiddenActions = actions.slice(showAllWhenCountLe - 1);

  const visibleButtons = visibleActions.map(action =>
    h(
      NButton,
      {
        size: 'small',
        quaternary: true,
        type: action.type ?? 'default',
        onClick: () => action.onClick(row)
      },
      {
        default: () => action.label
      }
    )
  );

  const moreOptions: DropdownOption[] = hiddenActions.map((action, index) => ({
    key: `${action.label}-${index}`,
    label: action.label
  }));

  return [
    h(
      NSpace,
      { size: 4, align: 'center', wrapItem: false },
      {
        default: () => [
          ...visibleButtons,
          h(
            NDropdown,
            {
              options: moreOptions,
              onSelect: key => {
                const action = hiddenActions.find(
                  (item, index) => `${item.label}-${index}` === key
                );
                if (action) action.onClick(row);
              }
            },
            {
              default: () =>
                h(
                  NButton,
                  {
                    size: 'small',
                    quaternary: true
                  },
                  {
                    default: () => '...'
                  }
                )
            }
          )
        ]
      }
    )
  ];
}
