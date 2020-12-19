import { Component, Engine } from "../../../lib/tsengine";
import { Filter as PIXIFilter, Graphics as PIXIGraphics, Texture as PIXITexture } from "pixi.js";

export class Graphics extends Component {

    private _graphics: PIXIGraphics;

    constructor() {
        super();
        this._graphics = new PIXIGraphics();
    }

    public get x(): number {
        return this._graphics.x;
    }

    public set x(_x: number) {
        this._graphics.x = _x;
    }

    public get y(): number {
        return this._graphics.y;
    }

    public set y(_y: number) {
        this._graphics.y = _y;
    }

    public get width(): number {
        return this._graphics.width;
    }

    public set width(_x: number) {
        this._graphics.width = _x;
    }

    public get height(): number {
        return this._graphics.height;
    }

    public set height(_y: number) {
        this._graphics.height = _y;
    }

    public addFilter(filter: PIXIFilter): void {
        if(!this._graphics.filters) this._graphics.filters = [];
        this._graphics.filters.push(filter);
    }

    public getGraphicsObj(): PIXIGraphics | null {
        return this._graphics || null;
    }

    public onAwake(): void {}

    public onStep(_engine: Engine): void {

    }

    public destroy(): void {
        this._graphics.destroy();
        this._graphics = null;
    }
}
