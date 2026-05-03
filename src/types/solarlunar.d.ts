declare module 'solarlunar' {
  // 包内类型与 exports 字段不完全对齐，此处用宽松声明保证库构建通过。
  const solarLunar: {
    solar2lunar: (year: number, month: number, day: number) => unknown;
    lunar2solar?: (...args: unknown[]) => Record<string, unknown>;
  };
  export default solarLunar;
}
