declare class CanvasRuler {
  protected ctx: CanvasRenderingContext2D;
  /**
   * 配置
   */
  options: Required<RulerOptions>;
  /**
   * 标尺起始点
   */
  startCalibration: undefined | fabric.Point;
  private activeOn;
  /**
   * 选取对象矩形坐标
   */
  private objectRect;
  /**
   * 事件句柄缓存
   */
  private eventHandler;
  private lastAttr;
  private tempGuidelLine;
  constructor(_options: RulerOptions);
  destroy(): void;
  /**
   * 移除全部辅助线
   */
  clearGuideline(): void;
  /**
   * 显示全部辅助线
   */
  showGuideline(): void;
  /**
   * 隐藏全部辅助线
   */
  hideGuideline(): void;
  /**
   * 启用
   */
  enable(): void;
  /**
   * 禁用
   */
  disable(): void;
  /**
   * 绘制
   */
  render(): void;
  /**
   * 获取画板尺寸
   */
  private getSize;
  private getZoom;
  private draw;
  /**
   * 计算起始点
   */
  private calcObjectRect;
  /**
   * 清除起始点和矩形坐标
   */
  private clearStatus;
  /**
    判断鼠标是否在标尺上
   * @param point
   * @returns "vertical" | "horizontal" | false
   */
  isPointOnRuler(point: Point): false | "horizontal" | "vertical";
  private canvasMouseDown;
  private getCommonEventInfo;
  private canvasMouseMove;
  private canvasMouseUp;
}

export interface Rect { left: number, top: number, width: number, height: number }
declare module 'fabric/fabric-impl' {
  export interface controlsUtils {
    rotationWithSnapping: any
  }

  type EventNameExt = 'removed' | EventName

  export interface Canvas {
    _setupCurrentTransform(e: Event, target: fabric.Object, alreadySelected: boolean): void
  }

  export interface IObservable<T> {
    on(
      eventName: 'guideline:moving' | 'guideline:mouseup',
      handler: (event: { e: Event, target: fabric.GuideLine }) => void
    ): T
    on(events: { [key: EventName]: (event: { e: Event, target: fabric.GuideLine }) => void }): T
  }

  export interface IGuideLineOptions extends ILineOptions {
    axis: 'horizontal' | 'vertical'
  }

  export interface IGuideLineClassOptions extends IGuideLineOptions {
    canvas: {
      setActiveObject(object: fabric.Object | fabric.GuideLine, e?: Event): Canvas
      remove<T>(...object: (fabric.Object | fabric.GuideLine)[]): T
    } & Canvas
    activeOn: 'down' | 'up'
    initialize(xy: number, objObjects: IGuideLineOptions): void
    callSuper(methodName: string, ...args: unknown[]): any
    getBoundingRect(absolute?: boolean, calculate?: boolean): Rect
    on(eventName: EventNameExt, handler: (e: IEvent<MouseEvent>) => void): void
    off(eventName: EventNameExt, handler?: (e: IEvent<MouseEvent>) => void): void
    fire<T>(eventName: EventNameExt, options?: any): T
    isPointOnRuler(e: MouseEvent): 'horizontal' | 'vertical' | false
    bringToFront(): fabric.Object
    isHorizontal(): boolean
  }

  // eslint-disable-next-line ts/no-unsafe-declaration-merging
  export interface GuideLine extends Line, IGuideLineClassOptions {}

  // eslint-disable-next-line ts/no-unsafe-declaration-merging
  export class GuideLine extends Line {
    constructor(xy: number, objObjects?: IGuideLineOptions)
    static fromObject(object: any, callback: any): void
  }

  export interface StaticCanvas {
    ruler: InstanceType<typeof CanvasRuler>
  }
}
