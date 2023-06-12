import * as PIXI from "pixi.js";
import * as Topics from "../Data/Topics";
import { LogUtils } from "../Utils";
import { IFocusable } from "./IFocusable";

export enum Direction {
    UP = "Up",
    RIGHT = "Right",
    DOWN = "Down",
    LEFT = "Left",
    FORWARDS = "Forwards",
    BACKWARDS = "Backwards",
}

interface INeighbourMap {
    from: IFocusable;
    to: IFocusable;
    direction: Direction;
}

/**
 * Keyboard map
 */
export class KeyboardMap {

    /**
     * Sets whether is active
     * @param pValue
     */
    public set isActive(pValue: boolean) {
        this._isActive = pValue;
        if (this._isActive === false && this._currentFocusable !== undefined) {
            this.clearFocus();
        } else if (this._isActive === true && this._currentFocusable === undefined) {
            this.focusFirstNode();
        }
    }

    get currentFocusable(): IFocusable | undefined {
        return this._currentFocusable;
    }

    private _isActive: boolean = false;
    private _currentFocusable: IFocusable | undefined;
    private _focusables: IFocusable[] = [];
    private _neighbours: INeighbourMap[] = [];

    /**
     * Clears keyboard map
     */
    public clear(): void {
        this._focusables.length = 0;
        this._neighbours.length = 0;
        this.clearFocus();
    }

    /**
     * Registers focusable
     * @param pFocusable
     */
    public registerFocusable(pFocusable: IFocusable | IFocusable[]): void {
        if (!Array.isArray(pFocusable)) {
            pFocusable = [pFocusable];
        }
        for (const focusable of pFocusable) {
            if (focusable && this._focusables.indexOf(focusable) < 0) {
                this._focusables.push(focusable);
            }
        }
        if (this._isActive === true && this._currentFocusable === undefined) {
            this.focusFirstNode();
        }
    }

    /**
     * Unregisters focusable
     * @param pFocusable
     */
    public unregisterFocusable(pFocusable: (IFocusable | ((it: IFocusable) => boolean)) | Array<IFocusable | ((it: IFocusable) => boolean)>): void {
        if (!Array.isArray(pFocusable)) {
            pFocusable = [pFocusable];
        }
        for (const focusable of pFocusable) {
            if (typeof focusable === "function") {
                this._focusables = this._focusables.filter((it) => !focusable(it));
            } else {
                const index = this._focusables.indexOf(focusable);
                if (index >= 0) {
                    this._focusables.splice(index, 1);
                }
            }
        }
        if (this._currentFocusable && pFocusable.indexOf(this._currentFocusable) > -1) {
            this.clearFocus();
            this.focusFirstNode();
        }
    }

    /**
     * Steps keyboard map
     * @param pDirection
     */
    public step(pDirection: Direction): void {
        if (this._currentFocusable === undefined) {
            this.focusFirstNode();
        } else {
            if (!this.stepToNeighbour(pDirection)) {
                const focusables = this._focusables.filter(this.isFocusable);
                if (focusables.length > 1) {
                    this.stepToNearest(pDirection, focusables);
                } else if (focusables.length > 0) {
                    this.setFocus(focusables[0]);
                } else {
                    this.clearFocus();
                }
            }
        }
    }

    /**
     * Clears focus
     */
    public clearFocus(): void {
        if (this._currentFocusable !== undefined) {
            this._currentFocusable.onFocusEnd();
            PubSub.publishSync(Topics.KEYBOARD_FOCUS_END, this._currentFocusable);
            this._currentFocusable = undefined;
        }
    }

    /**
     * Sets focus on a node if that node is interactive AND visible.
     * @param pFocusable
     */
    public setFocus(pFocusable: IFocusable): void {
        if (this._currentFocusable !== pFocusable) {
            if (this._currentFocusable !== undefined) {
                this._currentFocusable.onFocusEnd();
                PubSub.publishSync(Topics.KEYBOARD_FOCUS_END, this._currentFocusable);
            }
            this._currentFocusable = pFocusable;
            this._currentFocusable.onFocusBegin();
            PubSub.publishSync(Topics.KEYBOARD_FOCUS_BEGIN, this._currentFocusable);
        }
    }

    /**
     * Focuses the first node that is both interactive and visible
     */
    public focusFirstNode(): void {
        for (const focusable of this._focusables) {
            if (this.isFocusable(focusable)) {
                this.setFocus(focusable);
                return;
            }
        }
        LogUtils.logWarning("No registered focusables are currently focusable.", {className: "KeyboardMap", color: "brown"});
    }

    /**
     * Activates focussed node
     */
    public activateFocussedNode(): void {
        if (this._currentFocusable !== undefined) {
            this._currentFocusable.onFocusActivated();
        }
    }

    /**
     * Sets a neighbour for a node
     * @param pFocusable
     * @param pNeighbour
     * @param pDirection
     */
    public forceNeighbour(pFocusable: IFocusable, pNeighbour: IFocusable, pDirection: Direction): void {
        this._neighbours.push({from: pFocusable, to: pNeighbour, direction: pDirection});
    }

    public clearNeighbours() {
        this._neighbours.length = 0;
    }

    private stepToNeighbour(pDirection: Direction) {
        if (pDirection === Direction.FORWARDS || pDirection === Direction.BACKWARDS) {
            if (this._currentFocusable) {
                const focusables = this._focusables.filter(this.isFocusable);
                const index = focusables.indexOf(this._currentFocusable);

                if (pDirection === Direction.FORWARDS) {
                    if (focusables.length > (index + 1)) {
                        this.setFocus(focusables[index + 1]);
                        return true;
                    }
                    else {
                        this.setFocus(focusables[0]);
                        return true;
                    }
                }
                else { // backwards
                    if (index > 0) {
                        this.setFocus(focusables[index - 1]);
                        return true;
                    }
                    else if (index === 0) {
                        this.setFocus(focusables[focusables.length - 1]);
                        return true;
                    }
                }

            }
            return false;
        }

        for (const neighbour of this._neighbours) {
            if (neighbour.from === this._currentFocusable && neighbour.direction === pDirection && this.isFocusable(neighbour.to)) {
                this.setFocus(neighbour.to);
                return true;
            }
        }
        return false;
    }

    private stepToNearest(pDirection: Direction, focusables: IFocusable[]) {
        if (this._currentFocusable) {
            const position = this._currentFocusable.getFocusPosition();
            let weight: number = Number.MAX_VALUE;
            let nearest: IFocusable | undefined;
            for (const focusable of focusables) {
                if (focusable !== this._currentFocusable) {
                    const w = this.calculateWeight(position, focusable.getFocusPosition(), pDirection);
                    if (w < weight) {
                        weight = w;
                        nearest = focusable;
                    }
                }
            }
            if (nearest) {
                this.setFocus(nearest);
            }
        }
    }

    // TODO:SH: Optimize
    /**
     * Calculates weight
     * @todo SH: Optimize
     * @param posA
     * @param posB
     * @param pDirection
     * @returns weight
     */
    private calculateWeight(posA: PIXI.IPoint, posB: PIXI.IPoint, pDirection: Direction): number {
        const xDiff: number = posB.x - posA.x;
        const yDiff: number = posB.y - posA.y;

        switch (pDirection) {
            case Direction.UP:
                return yDiff >= 0 ? Number.MAX_VALUE : this.temp(Math.abs(yDiff), Math.abs(xDiff));
            case Direction.RIGHT:
                return xDiff <= 0 ? Number.MAX_VALUE : this.temp(Math.abs(xDiff), Math.abs(yDiff));
            case Direction.DOWN:
                return yDiff <= 0 ? Number.MAX_VALUE : this.temp(Math.abs(yDiff), Math.abs(xDiff));
            case Direction.LEFT:
            default:
                return xDiff >= 0 ? Number.MAX_VALUE : this.temp(Math.abs(xDiff), Math.abs(yDiff));
        }
    }

    /**
     * Temps keyboard map
     * @param pParallel
     * @param pPerpendicular
     * @returns temp
     */
    private temp(pParallel: number, pPerpendicular: number): number {
        return pParallel + pPerpendicular * (pPerpendicular / pParallel);
    }

    private isFocusable(focusable: IFocusable) {
        return focusable.isFocusable ?
            focusable.isFocusable() :
            (focusable instanceof PIXI.Container) ? (focusable.interactive && focusable.worldVisible) : false;
    }
}
