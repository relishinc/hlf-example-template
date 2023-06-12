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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Popup = exports.POPUP_STATE = void 0;
const pixi_js_1 = require("pixi.js");
const Topics = __importStar(require("../Data/Topics"));
var POPUP_STATE;
(function (POPUP_STATE) {
    POPUP_STATE[POPUP_STATE["CLOSED"] = 0] = "CLOSED";
    POPUP_STATE[POPUP_STATE["OPENING"] = 1] = "OPENING";
    POPUP_STATE[POPUP_STATE["OPEN"] = 2] = "OPEN";
    POPUP_STATE[POPUP_STATE["CLOSING"] = 3] = "CLOSING";
})(POPUP_STATE = exports.POPUP_STATE || (exports.POPUP_STATE = {}));
/**
 * This is an abstract class from which all Popups should inherit.
 * However, you can also make your own implementation of {@link IPopup} if necessary.
 */
class Popup extends pixi_js_1.Container {
    constructor() {
        super(...arguments);
        /** Private backing field for {@link state} */
        this._state = POPUP_STATE.CLOSED;
        /** Storage for for {@link PopupToken.backdrop} */
        this._clickBackdropToClose = true;
        /** Private backing field for {@link keyboardToClose} */
        this._keyboardToClose = true;
    }
    /** @inheritdoc */
    get id() {
        return this._id;
    }
    /** This is used to prevent duplicate calls to e.g. {@link hide} */
    get state() {
        return this._state;
    }
    /** @inheritdoc */
    get keyboardToClose() {
        return this._keyboardToClose;
    }
    get popupData() {
        return this._popupData;
    }
    /** Hide the popup, but only if it's open */
    hide() {
        if (this.state === POPUP_STATE.OPEN) {
            this._hide();
        }
    }
    /** @inheritdoc */
    init(pSize) {
        this._state = POPUP_STATE.CLOSED;
        this.onResize(pSize);
        if (this.blackout !== undefined) {
            this.blackout.on("click", this.OnBlackoutClicked.bind(this));
        }
    }
    /** @inheritdoc */
    onResize(pSize) {
        if (this.blackout !== undefined) {
            this.blackout.x = -pSize.x / 2;
            this.blackout.y = -pSize.y / 2;
            this.blackout.width = pSize.x;
            this.blackout.height = pSize.y;
        }
    }
    /**
     * Update tick. Needed for some animations.
     * Override this
     * @param pDeltaTime Seconds elapsed since last call to {@link update}
     * @override
     */
    update(pDeltaTime) {
        // Override me
    }
    /**
     * Show the popup, and set the close callback
     * You probably want to override {@link AnimateIn}, not {@link show}
     * @override
     */
    show(pToken) {
        var _a, _b;
        this._id = pToken.id;
        this._callback = pToken.callback;
        this._state = POPUP_STATE.OPENING;
        this._clickBackdropToClose = (_a = pToken.backdrop) !== null && _a !== void 0 ? _a : true;
        this._keyboardToClose = (_b = pToken.keyboard) !== null && _b !== void 0 ? _b : true;
        this._popupData = pToken.data;
        this.AnimateIn(this.OnAnimateInComplete.bind(this));
    }
    destroy(options) {
        this._callback = undefined;
        this._popupData = undefined;
        super.destroy(options);
    }
    /**
     * Click handler for {@link blackout}
     * Feel free to override this
     */
    OnBlackoutClicked() {
        if (this._clickBackdropToClose === true) {
            this.hide();
        }
    }
    /**
     * This changes the popup's state to {@link POPUP_STATE.OPEN}
     * You may want to override this to do more things after the animation has completed
     */
    OnAnimateInComplete() {
        this._state = POPUP_STATE.OPEN;
    }
    /**
     * Hides the popup, and disables click handling on all children
     * You probably want to override {@link hide} or {@link AnimateOut}, not {@link _hide}
     * @override
     */
    _hide() {
        this.interactiveChildren = false;
        if (this.blackout !== undefined) {
            this.blackout.off("click");
        }
        this._state = POPUP_STATE.CLOSING;
        this.AnimateOut(this.OnAnimateOutComplete.bind(this));
    }
    /**
     * This calls the popup's callback (which came from the `pToken` parameter in {@link show})
     * and also tells {@link PopupManager} that we are finished animating out, so the popup can be destroyed or pooled
     */
    OnAnimateOutComplete() {
        this._state = POPUP_STATE.CLOSED;
        if (this._callback !== undefined) {
            const callback = this._callback;
            this._callback = undefined;
            callback();
        }
        PubSub.publishSync(Topics.HIDE_POPUP_COMPLETE, this);
    }
}
exports.Popup = Popup;
//# sourceMappingURL=Popup.js.map