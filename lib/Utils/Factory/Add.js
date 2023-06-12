"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddFactory = void 0;
const pixi_js_1 = require("pixi.js");
const Application_1 = require("../../Application");
const PhysicsSprite_1 = require("../../GameObjects/PhysicsSprite");
const Make_1 = require("./Make");
const utils_1 = require("./utils");
class AddFactory {
    constructor(defaultContainer) {
        this.defaultContainer = defaultContainer;
        this._make = new Make_1.MakeFactory();
    }
    existing(pObject) {
        return this.defaultContainer.addChild(pObject);
    }
    coloredSprite(color = 0x0, alpha = 1, position = {
        x: 0,
        y: 0
    }, anchor = { x: 0.5, y: 0.5 }, scale = { x: 1, y: 1 }) {
        const gfx = new pixi_js_1.Graphics();
        gfx.beginFill(color);
        gfx.drawRect(0, 0, 1, 1);
        gfx.endFill();
        const sprite = this._make.sprite(Application_1.Application.instance.renderer.generateTexture(gfx));
        sprite.tint = color;
        sprite.alpha = alpha;
        const resolvedPosition = (0, utils_1.resolveXYFromObjectOrArray)(position);
        const resolvedAnchor = (0, utils_1.resolveXYFromObjectOrArray)(anchor);
        const resolvedScale = (0, utils_1.resolveXYFromObjectOrArray)(scale);
        sprite.x = resolvedPosition.x;
        sprite.y = resolvedPosition.y;
        sprite.anchor.x = resolvedAnchor.x;
        sprite.anchor.y = resolvedAnchor.y;
        sprite.scale.x = resolvedScale.x;
        sprite.scale.y = resolvedScale.y;
        return this.defaultContainer.addChild(sprite);
    }
    sprite(pAsset, pSheet, alpha = 1, position = { x: 0, y: 0 }, anchor = { x: 0.5, y: 0.5 }, scale = { x: 1, y: 1 }) {
        const sprite = this._make.sprite(pAsset, pSheet);
        sprite.alpha = alpha;
        const resolvedPosition = (0, utils_1.resolveXYFromObjectOrArray)(position);
        const resolvedAnchor = (0, utils_1.resolveXYFromObjectOrArray)(anchor);
        const resolvedScale = (0, utils_1.resolveXYFromObjectOrArray)(scale);
        sprite.x = resolvedPosition.x;
        sprite.y = resolvedPosition.y;
        sprite.anchor.x = resolvedAnchor.x;
        sprite.anchor.y = resolvedAnchor.y;
        sprite.scale.x = resolvedScale.x;
        sprite.scale.y = resolvedScale.y;
        return this.defaultContainer.addChild(sprite);
    }
    text(pText = ``, pStyle, alpha = 1, position = { x: 0, y: 0 }, anchor = { x: 0.5, y: 0.5 }, scale = { x: 1, y: 1 }) {
        const text = this._make.text(pText, pStyle);
        text.alpha = alpha;
        const resolvedPosition = (0, utils_1.resolveXYFromObjectOrArray)(position);
        const resolvedAnchor = (0, utils_1.resolveXYFromObjectOrArray)(anchor);
        const resolvedScale = (0, utils_1.resolveXYFromObjectOrArray)(scale);
        text.x = resolvedPosition.x;
        text.y = resolvedPosition.y;
        text.anchor.x = resolvedAnchor.x;
        text.anchor.y = resolvedAnchor.y;
        text.scale.x = resolvedScale.x;
        text.scale.y = resolvedScale.y;
        return this.defaultContainer.addChild(text);
    }
    // Add BitmapText
    bitmapText(pText, pStyle, alpha = 1, position = { x: 0, y: 0 }, anchor = { x: 0.5, y: 0.5 }, scale = { x: 1, y: 1 }) {
        const bitmapText = this._make.bitmapText(pText, pStyle);
        bitmapText.alpha = alpha;
        const resolvedPosition = (0, utils_1.resolveXYFromObjectOrArray)(position);
        const resolvedAnchor = (0, utils_1.resolveXYFromObjectOrArray)(anchor);
        const resolvedScale = (0, utils_1.resolveXYFromObjectOrArray)(scale);
        bitmapText.x = resolvedPosition.x;
        bitmapText.y = resolvedPosition.y;
        bitmapText.anchor.x = resolvedAnchor.x;
        bitmapText.anchor.y = resolvedAnchor.y;
        bitmapText.scale.x = resolvedScale.x;
        bitmapText.scale.y = resolvedScale.y;
        return this.defaultContainer.addChild(bitmapText);
    }
    // Add Container
    container(alpha = 1, position = { x: 0, y: 0 }, scale = { x: 1, y: 1 }) {
        const container = this._make.container();
        container.alpha = alpha;
        const resolvedPosition = (0, utils_1.resolveXYFromObjectOrArray)(position);
        const resolvedScale = (0, utils_1.resolveXYFromObjectOrArray)(scale);
        container.x = resolvedPosition.x;
        container.y = resolvedPosition.y;
        container.scale.x = resolvedScale.x;
        container.scale.y = resolvedScale.y;
        return this.defaultContainer.addChild(container);
    }
    // Add Graphics
    graphics(alpha = 1, position = { x: 0, y: 0 }, scale = { x: 1, y: 1 }) {
        const graphics = this._make.graphics();
        graphics.alpha = alpha;
        const resolvedPosition = (0, utils_1.resolveXYFromObjectOrArray)(position);
        const resolvedScale = (0, utils_1.resolveXYFromObjectOrArray)(scale);
        graphics.x = resolvedPosition.x;
        graphics.y = resolvedPosition.y;
        graphics.scale.x = resolvedScale.x;
        graphics.scale.y = resolvedScale.y;
        return this.defaultContainer.addChild(graphics);
    }
    // add physics sprite
    physicsSprite(pTexture, pSheet, pSize, pType = PhysicsSprite_1.BodyType.RECTANGLE, pAlpha = 1, pPosition = { x: 0, y: 0 }) {
        const sprite = this._make.physicsSprite(pTexture, pSheet, pSize, pType);
        sprite.alpha = pAlpha;
        const resolvedPosition = (0, utils_1.resolveXYFromObjectOrArray)(pPosition);
        sprite.x = resolvedPosition.x;
        sprite.y = resolvedPosition.y;
        return this.defaultContainer.addChild(sprite);
    }
}
exports.AddFactory = AddFactory;
//# sourceMappingURL=Add.js.map