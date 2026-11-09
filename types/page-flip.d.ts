declare module "page-flip" {
  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Record<string, any>);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    loadFromImages(imagesHref: string[]): void;
    flipNext(corner?: string): void;
    flipPrev(corner?: string): void;
    flip(page: number, corner?: string): void;
    turnToPage(page: number): void;
    startUserTouch(pos: { x: number; y: number }): void;
    getPageCollection(): any;
    getUI(): any;
    on(event: string, callback: (e: any) => void): void;
    destroy(): void;
  }
}
