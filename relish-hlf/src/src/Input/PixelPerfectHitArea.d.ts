import * as PIXI from "pixi.js";
/**
 * Pixel perfect hit area
 */
export declare class PixelPerfectHitArea implements PIXI.IHitArea {
    private _map;
    private _target;
    private _norm;
    private _pixel;
    constructor(pRenderer: PIXI.Renderer, pTarget: PIXI.Sprite, pTheshhold?: number);
    /**
     * Gets width
     */
    get width(): number;
    /**
     * Gets scaled width
     */
    get scaledWidth(): number;
    /**
     * Gets height
     */
    get height(): number;
    /**
     * Gets scaled height
     */
    get scaledHeight(): number;
    /**
     * Gets hit area at pixel
     * @param pX
     * @param pY
     * @returns boolean
     */
    getHitAreaAtPixel(pX: number, pY: number): boolean;
    /**
     * Contains pixel perfect hit area
     * @param pX
     * @param pY
     * @returns boolean
     */
    contains(pX: number, pY: number): boolean;
}
//# sourceMappingURL=PixelPerfectHitArea.d.ts.map