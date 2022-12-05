/** Source: [build-plugin.d.ts](./packages/builder/@types/protect/build-plugin.d.ts) */
declare module '@builder/build-plugin' {
  export interface IPanelThis {
    $: Record<string, HTMLElement>;
    dispatch: (name: string, ...args: any[]) => void;

    // Extra
    $this: HTMLElement;
  }
}
