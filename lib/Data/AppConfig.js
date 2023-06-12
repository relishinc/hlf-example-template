"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfig = void 0;
const Utils_1 = require("../Utils");
class AppConfig {
    constructor(pConfig) {
        // If no config is provided, create a default one
        if (pConfig === undefined) {
            pConfig = {
                antialias: false,
                autoStart: false,
                background: undefined,
                backgroundAlpha: 0,
                backgroundColor: "transparent",
                clearBeforeRender: false,
                context: null,
                eventFeatures: undefined,
                eventMode: undefined,
                forceCanvas: false,
                height: 0,
                hello: false,
                powerPreference: "default",
                premultipliedAlpha: false,
                preserveDrawingBuffer: false,
                resizeTo: undefined,
                sharedTicker: false,
                useContextAlpha: undefined,
                view: undefined,
                width: 0,
                autoDensity: true,
                resolution: Utils_1.PlatformUtils.isMobile() ? Utils_1.PlatformUtils.isRetina() ? 2 : 1 : 2
            };
        }
        else {
            // If a config is provided but particular properties are not set that need to be, do your sanity checks here.
            if (pConfig.autoDensity === undefined || !pConfig.autoDensity) {
                pConfig.autoDensity = true;
            }
            if (pConfig.powerPreference === undefined) {
                pConfig.powerPreference = "default";
            }
        }
        // If the resolution is set to anything other than a number, determine the resolution from runtime check
        if (typeof (pConfig === null || pConfig === void 0 ? void 0 : pConfig.resolution) !== "number") {
            this.resolution = Utils_1.PlatformUtils.isMobile() ? Utils_1.PlatformUtils.isRetina() ? 2 : 1 : 2;
        }
        else {
            // Ensure that the resolution is either 1 or 2 only
            this.resolution = pConfig.resolution;
            this.resolution = Math.round(this.resolution);
            this.resolution = Utils_1.MathUtils.clamp(this.resolution, 1, 2);
        }
        // Automatically enable the Amazon fix if we are on Amazon
        /**
         * This is used to handle a flicker that occurs when playing app on an Amazon OS device.
         * PIXI suggests enabling preserveDrawingBuffer on these devices so that was the initial course of action. PIXI
         * warned that this could cause performance issues.
         * Feedback from a client suggested that using transparent would yield the intended result with less side
         * effects.
         *  if (pConfig.preserveDrawingBuffer !== undefined) {
         *      this.preserveDrawingBuffer = pConfig.preserveDrawingBuffer;
         *  }
         *  else {
         *      this.preserveDrawingBuffer = PlatformUtils.isAmazonOS();
         *  }
         */
        if (pConfig === null || pConfig === void 0 ? void 0 : pConfig.transparent) {
            this.transparent = pConfig.transparent;
        }
        else {
            this.transparent = Utils_1.PlatformUtils.isAmazonOS();
        }
        // If properties exist in the json, set them in the config
        for (const key in pConfig) {
            if (pConfig.hasOwnProperty(key)) {
                if (key === "resolution" ||
                    /**
                     * See the above comment block
                     */
                    // key === "preserveDrawingBuffer") {
                    key === "transparent") {
                    //
                }
                else {
                    this[key] = pConfig[key];
                }
            }
        }
    }
}
exports.AppConfig = AppConfig;
//# sourceMappingURL=AppConfig.js.map