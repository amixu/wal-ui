/** 日历单元格元数据 */
export type DateCellType = {
  cornerText?: string;
  borderColor?: string;
  cornerBg?: string;
  bgColor?: string;
  bottomText?: string;
  bottomColor?: string;
};

/** 动作按钮类型 */
export type ActionButtonType =
  | 'prev'
  | 'next'
  | 'search'
  | 'reset'
  | 'add'
  | 'edit'
  | 'del'
  | 'upload'
  | 'download'
  | 'setting'
  | 'enable'
  | 'disable'
  | 'submit'
  | 'online'
  | 'offline'
  | 'cancel'
  | 'save'
  | 'refresh'
  | 'confirm';
