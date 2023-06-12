"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Physics = void 0;
const matter_js_1 = require("matter-js");
class Physics {
    constructor(app) {
        this.app = app;
        this._updateables = [];
        this._debug = true;
        this._bounds = { x: 0, y: 0 };
        this._isRunning = false;
    }
    get engine() {
        return this._engine;
    }
    set debug(pDebug) {
        var _a, _b, _c;
        this._debug = pDebug;
        if (!this._debug) {
            (_a = this._debugContainer) === null || _a === void 0 ? void 0 : _a.parent.removeChild(this._debugContainer);
            (_b = this._debugGraphics) === null || _b === void 0 ? void 0 : _b.destroy({ children: true });
            (_c = this._debugContainer) === null || _c === void 0 ? void 0 : _c.destroy({ children: true });
        }
    }
    get debug() {
        return this._debug;
    }
    init(pAutoStart = false, pDebug = false, autoCreateBounds = true, pEngineOptions = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            // don't load the matter js module until we need it
            yield Promise.resolve().then(() => __importStar(require('matter-js'))).then((module) => {
                globalThis.Matter = module;
            });
            const opts = pEngineOptions || {};
            this._debug = pDebug;
            this._engine = Matter.Engine.create(opts);
            if (autoCreateBounds) {
                this.createWorldBounds();
            }
            if (pAutoStart) {
                this.start();
            }
            return Promise.resolve();
        });
    }
    createWorldBounds(useStage = true) {
        const thickness = 50; // or however thick you want the boundaries to be
        const width = useStage ? this.app.size.x : this._bounds.x;
        const height = useStage ? this.app.size.y : this._bounds.y;
        // Top boundary
        const top = matter_js_1.Bodies.rectangle(-thickness / 2, -height / 2 - thickness / 2, width + thickness, thickness, { isStatic: true });
        // Bottom boundary
        const bottom = matter_js_1.Bodies.rectangle(-thickness / 2, height / 2 + thickness / 2, width + thickness, thickness, { isStatic: true });
        // Left boundary
        const left = matter_js_1.Bodies.rectangle(-width / 2 - thickness / 2, -thickness / 2, thickness, height + thickness, { isStatic: true });
        // Right boundary
        const right = matter_js_1.Bodies.rectangle(width / 2 + thickness / 2, -thickness / 2, thickness, height + thickness, { isStatic: true });
        // Add these bodies to the world
        this.add(top, bottom, left, right);
    }
    start() {
        this._isRunning = true;
    }
    stop() {
        this._isRunning = false;
    }
    add(...objects) {
        objects.forEach((obj) => {
            let body;
            if (obj.hasOwnProperty("body")) {
                body = obj.body;
                this._updateables.push(obj);
            }
            else {
                body = obj;
            }
            Matter.World.add(this._engine.world, body);
        });
    }
    remove(...bodies) {
        bodies.forEach((body) => {
            Matter.World.remove(this._engine.world, body);
        });
    }
    drawDebug() {
        if (!this._debugGraphics || !this._debugContainer || !this._debugGraphics.parent) {
            this._debugContainer = this.app.make.container();
            this.app.add.existing(this._debugContainer);
            this._debugGraphics = this.app.make.graphics();
            this._debugContainer.addChild(this._debugGraphics);
            this._debugContainer.x = this.app.resizer.getSize().x * 0.5;
            this._debugContainer.y = this.app.resizer.getSize().y * 0.5;
            this.app.stage.setChildIndex(this._debugContainer, this.app.stage.children.length - 1);
        }
        this._debugGraphics.clear();
        for (let i = 0; i < this._updateables.length; i++) {
            const updateable = this._updateables[i];
            const body = this._updateables[i].body;
            const color = (updateable === null || updateable === void 0 ? void 0 : updateable.debugColor) || 0x29c5f6;
            const vertices = body.vertices;
            this._debugGraphics.lineStyle(1, 0x00ff00, 1);
            this._debugGraphics.beginFill(color, 0.5);
            this._debugGraphics.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1; j < vertices.length; j++) {
                this._debugGraphics.lineTo(vertices[j].x, vertices[j].y);
            }
            this._debugGraphics.lineTo(vertices[0].x, vertices[0].y);
            this._debugGraphics.endFill();
        }
    }
    update(deltaTime) {
        if (!this._isRunning) {
            return;
        }
        if (typeof Matter === `undefined` || !this._engine) {
            return;
        }
        if (this._engine) {
            this._updateables.forEach((obj) => {
                obj.update();
            });
            if (this._debug) {
                this.drawDebug();
            }
            Matter.Engine.update(this._engine, 16.666666666666668, 1);
        }
    }
}
exports.Physics = Physics;
//# sourceMappingURL=index.js.map