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
exports.LoadManager = void 0;
const pixi_js_1 = require("pixi.js");
const typescript_collections_1 = require("typescript-collections");
const Application_1 = require("../Application");
const Topics = __importStar(require("../Data/Topics"));
const Utils_1 = require("../Utils");
const LogUtils = __importStar(require("../Utils/LogUtils"));
const AssetMap_1 = require("./AssetMap");
const AssetMapAudioData_1 = require("./AssetMapAudioData");
const SplashScreen_1 = require("./SplashScreen");
/**
 * Manages all asset loading.
 * @extends Container
 */
class LoadManager extends pixi_js_1.Container {
    /**
     * Creates an instance of a `LoadManager` and returns it.
     * @param app The parant @link {Application}
     * @param pSplashScreen The splashscreen instance to use.
     */
    constructor(app, pSplashScreen) {
        super();
        this.app = app;
        /**
         * Is current load screen persistent or created and destroyed on demand
         */
        this._isCurrentLoadScreenPersistent = true;
        /**
         * The internal flag for print log statements.
         */
        this._debug = false;
        this._size = new pixi_js_1.Point();
        this._loadScreens = new typescript_collections_1.Dictionary();
        this._currentLoadScreen = pSplashScreen;
        this._splashScreen = pSplashScreen;
        this.showLoadScreen = this.showLoadScreen.bind(this);
        this.hideLoadScreen = this.hideLoadScreen.bind(this);
        this.onLoadRequested = this.onLoadRequested.bind(this);
        this.onUnloadRequested = this.onUnloadRequested.bind(this);
        this.onLoadScreenComplete = this.onLoadScreenComplete.bind(this);
        this.onAudioLoadProgress = this.onAudioLoadProgress.bind(this);
        this.onAllLoadsComplete = this.onAllLoadsComplete.bind(this);
        this.onPixiLoadProgress = this.onPixiLoadProgress.bind(this);
        this.onPixiLoadError = this.onPixiLoadError.bind(this);
        this.app.subscribe(Topics.SHOW_LOAD_SCREEN, this.showLoadScreen);
        this.app.subscribe(Topics.HIDE_LOAD_SCREEN, this.hideLoadScreen);
        this.app.subscribe(Topics.LOAD_ASSETS, this.onLoadRequested);
        this.app.subscribe(Topics.UNLOAD_ASSETS, this.onUnloadRequested);
    }
    /**
     * Enabling this will print all debug logs.
     */
    set debug(pEnabled) {
        this._debug = pEnabled;
    }
    /**
     * Updates the current active load screen.
     * @param pDeltaTime PIXI.ticker.shared.elapsedMS / 1000.
     */
    update(pDeltaTime) {
        if (this._currentLoadScreen !== undefined) {
            this._currentLoadScreen.update(pDeltaTime);
        }
    }
    /**
     * Begins the initial splash process.
     * @description
     * 1. Splash screen assets loaded.
     * 2. Splash screen is shown.
     * 3. Persistent assets are loaded.
     * 4. Callback passed in is called.
     * @param pPersistentAssets The assets that should persist between all state changes.
     * @param pOnComplete The function to call after all persitent assets have been loaded.
     */
    startSplashProcess(pPersistentAssets, pOnComplete) {
        // Remove assets from the persistent list that will already be loaded by the splash screen.
        const splashAssets = AssetMap_1.AssetMap.getAssetGroup(SplashScreen_1.SplashScreen.NAME);
        const trimmedRequiredAssets = new Array();
        for (let i = 0; i < pPersistentAssets.length; i++) {
            const requiredAsset = pPersistentAssets[i];
            let found = false;
            for (let j = 0; j < splashAssets.length; j++) {
                const splashAsset = splashAssets[j];
                if (requiredAsset.assetName === splashAsset.assetName) {
                    if (requiredAsset.assetType === splashAsset.assetType) {
                        found = true;
                        break;
                    }
                }
            }
            if (found === false) {
                trimmedRequiredAssets.push(requiredAsset);
            }
        }
        // Load splash assets
        // On complete, show the splash screen
        this.loadOnSplash(AssetMap_1.AssetMap.getAssetGroup(SplashScreen_1.SplashScreen.NAME), () => {
            // On animate in complete, load required assets
            // On complete, call passed in callback
            this._splashScreen.init(this._size);
            this.addChild(this._splashScreen);
            this._splashScreen.animateIn(() => this.load(trimmedRequiredAssets, pOnComplete));
        });
    }
    /**
     * Registers a load screen.
     * @param pKey The id of the load screen.
     * @param pScreen The load screen.
     * @param [pDefault] Is the new load screen the default one.
     */
    registerLoadScreen(pKey, pScreen, pDefault = false) {
        this._loadScreens.setValue(pKey, pScreen);
        if (pDefault) {
            this._defaultLoadScreen = pScreen;
        }
    }
    /**
     * Called when the window is resized.
     * @param pSize The new size.
     */
    onResize(pSize) {
        this._size.copyFrom(pSize);
        if (this._currentLoadScreen !== undefined) {
            this._currentLoadScreen.onResize(this._size);
        }
    }
    /**
     * Attempts to show the requested load screen.
     * @param pTopic The PubSub message id.
     * @param pData Data containing what loadscreen to show and what to call when it is shown.
     */
    showLoadScreen(pTopic, pData) {
        this.log("Show load screen requested: %c%s", LogUtils.STYLE_RED_BOLD, pData.loadScreen);
        this._currentLoadScreen = this.getLoadScreen(pData.loadScreen);
        if (this._currentLoadScreen !== undefined) {
            this._currentLoadScreen.init(this._size, pData.stateData);
            this.addChild(this._currentLoadScreen);
            this._currentLoadScreen.animateIn(() => {
                this.log("Load screen animate in complete.");
                pData.callback();
            });
        }
        else {
            this.logE("%c%s%c has not been registered as a load screen. Please include it in your registerLoadScreen " +
                "implementation.", LogUtils.STYLE_RED_BOLD, pData.loadScreen, LogUtils.STYLE_BLACK);
        }
    }
    /**
     * Attempts to hide the requested load screen.
     * @param pTopic The PubSub message id.
     * @param pData Data containing what loadscreen to hide and what to call when it is hidden.
     */
    hideLoadScreen(pTopic, pData) {
        this.log("Hide load screen requested: %c%s", LogUtils.STYLE_RED_BOLD, pData.loadScreen);
        const data = pData;
        if (this._currentLoadScreen === undefined) {
            this._currentLoadScreen = this.getLoadScreen(pData.loadScreen);
        }
        if (this._currentLoadScreen !== undefined) {
            this._currentLoadScreen.animateOut(() => {
                this.onLoadAnimateOutComplete();
                data.callback();
            });
        }
        else {
            this.logE("%c%s%c has not been registered as a load screen. Please include it in your registerLoadScreen " +
                "implementation.", LogUtils.STYLE_RED_BOLD, pData.loadScreen, LogUtils.STYLE_BLACK);
        }
    }
    /**
     * Loads requested assets using the supplied loadscreen.
     * @param pAssets The assets to load.
     * @param pOnComplete The function to call when the load is complete.
     */
    load(pAssets, pOnComplete) {
        if (this._onLoadComplete !== undefined) {
            this.logW("Replacing existing _onLoadComplete callback!");
        }
        this.log("Asset Load requested. Count: %c%s", LogUtils.STYLE_RED_BOLD, pAssets === undefined ? "Nothing to load" : pAssets.length);
        this._onLoadComplete = pOnComplete;
        this.loadAssets(pAssets);
    }
    /**
     * Loads assets needed by the splash screen.
     * @param pAssets The splash screen assets to load.
     * @param pOnComplete The function to call when assets are loaded.
     */
    loadOnSplash(pAssets, pOnComplete) {
        if (this._onLoadComplete !== undefined) {
            this.logW("Replacing existing _onLoadComplete callback!");
        }
        this.log("Splash Asset Load requested. Count: %c%s", LogUtils.STYLE_RED_BOLD, pAssets === undefined ? "Nothing to load" : pAssets.length);
        this._onLoadComplete = pOnComplete;
        this._currentLoadScreen = this._splashScreen;
        this.loadAssets(pAssets);
    }
    /**
     * Removes assets from PIXI cache.
     * @param pAssets The assets to unload.
     * @param pOnComplete The function to call when the unload is complete.
     */
    unload(pAssets, pOnComplete) {
        if (pAssets !== undefined) {
            for (const asset of pAssets) {
                this.log("Trying to destroy %c%s", LogUtils.STYLE_RED_BOLD, asset.assetName);
                if (asset instanceof AssetMapAudioData_1.AssetMapAudioData) {
                    this.destroyAudioResource(asset);
                }
                else {
                    this.destroyPixiResource(asset.assetName);
                }
                asset.destroy();
            }
        }
        if (pOnComplete !== undefined) {
            pOnComplete();
        }
    }
    /**
     * Retrieves a load screen.
     * @param pLoadScreen The load screen to retrieve.
     * @returns The requested load screen or undefined.
     */
    getLoadScreen(pLoadScreen) {
        this._isCurrentLoadScreenPersistent = true;
        if (pLoadScreen !== undefined) {
            let loadScreen = this._loadScreens.getValue(pLoadScreen);
            if (typeof loadScreen === "function") {
                this._isCurrentLoadScreenPersistent = false;
                loadScreen = loadScreen();
            }
            if (loadScreen !== undefined) {
                this.log("Loadscreen %c%s%c found", LogUtils.STYLE_RED_BOLD, pLoadScreen, LogUtils.STYLE_BLACK);
                return loadScreen;
            }
            else {
                this.log("Load screen %c%s%c not found", LogUtils.STYLE_RED_BOLD, pLoadScreen, LogUtils.STYLE_BLACK);
                return undefined;
            }
        }
        else {
            this.log("No load screen requested -> Returning the default loadscreen");
            let loadScreen = this._defaultLoadScreen;
            if (typeof loadScreen === "function") {
                this._isCurrentLoadScreenPersistent = false;
                loadScreen = loadScreen();
            }
            return loadScreen;
        }
    }
    /**
     * Loads the requested assets.
     * @todo Relish SH => Find out how to properly handle load screens when assets are already cached.
     * Currently, doesn't animate load bar at all (remains empty) since no loading occurs.
     * Ideally, should animate to full, OR not appear at all.
     * @param pAssets The assets requested.
     */
    loadAssets(pAssets) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pAssets !== undefined) {
                const assets = this.removeRedundantLoads(pAssets);
                const audioAssets = [];
                const defaultAssets = [];
                for (const asset of assets) {
                    if (asset.resolutionSuffix &&
                        asset.resolutionSuffix !== Utils_1.AssetUtils.resolutionSuffix) {
                        continue;
                    }
                    this.log("file requested: %c%s", LogUtils.STYLE_RED_BOLD, asset.assetName);
                    if (asset instanceof AssetMapAudioData_1.AssetMapAudioData) {
                        audioAssets.push(asset);
                    }
                    else {
                        const src = asset.assetPath
                            ? Utils_1.AssetUtils.replaceResolutionToken(asset.assetPath)
                            : Utils_1.AssetUtils.getPathToAsset(asset);
                        pixi_js_1.Assets.add(asset.assetName, src);
                        defaultAssets.push(asset.assetName);
                    }
                }
                if (audioAssets.length > 0) {
                    yield pixi_js_1.Assets.load(audioAssets.map((asset) => asset.getResource().src), this.onPixiLoadProgress);
                    this.app.broadcast(Topics.LOAD_AUDIO_FROM_ASSET_MAP, {
                        assets: audioAssets,
                        progressCallback: this.onAudioLoadProgress,
                        callback: this.onAllLoadsComplete
                    });
                }
                else {
                    const loaderResult = yield pixi_js_1.Assets.load(defaultAssets, this.onPixiLoadProgress).catch((e) => this.onPixiLoadError(e));
                    this.onAllLoadsComplete();
                }
            }
            else {
                this.log("Nothing to load");
                this.onAllLoadsComplete();
            }
        });
    }
    /**
     * Unloads the track and removes it from the AudioManager.
     * @param pData The audio data of thee track to destroy.
     */
    destroyAudioResource(pData) {
        Application_1.Application.instance.audio.unload(pData.assetName, pData.category, true);
    }
    /**
     * Removes assets from PIXI cache and unloads them from webGL.
     * @param pId The id of the asset to destroy.
     */
    destroyPixiResource(pId) {
        pixi_js_1.Assets.unload(pId);
    }
    /**
     * Removes redundant requested loads.
     * @param pAssets The asset list to search through.
     * @returns The trimmed down asset list.
     */
    removeRedundantLoads(pAssets) {
        const prunedAssets = new Array();
        let curAsset;
        for (let i = 0; i < pAssets.length; ++i) {
            let isFound = false;
            curAsset = pAssets[i];
            for (let j = 0; j < prunedAssets.length; j++) {
                const assetInList = prunedAssets[j];
                if (assetInList.assetName === curAsset.assetName &&
                    assetInList.resolutionSuffix === curAsset.resolutionSuffix) {
                    isFound = true;
                    break;
                }
            }
            if (!isFound) {
                this.log("Adding %c%s%c to the final list.", LogUtils.STYLE_RED_BOLD, curAsset.assetName, LogUtils.STYLE_BLACK);
                prunedAssets.push(curAsset);
            }
            else {
                this.log("Excluding %c%s%c from the final list because it is already included.", LogUtils.STYLE_RED_BOLD, curAsset.assetName, LogUtils.STYLE_BLACK);
            }
        }
        return prunedAssets;
    }
    /**
     * Called when a file is loaded in PIXI.
     * @param pLoader The PIXI loader.
     * @param pResource The resource that was loaded.
     */
    onPixiLoadProgress(progress) {
        if (this._currentLoadScreen !== undefined) {
            this._currentLoadScreen.onLoadProgress(progress);
        }
    }
    onPixiLoadError(error) {
        this.logE(error.message);
    }
    /**
     * Called when a file is loaded by the {@link IAudioManager} (usually {@link HowlerManager}).
     * @param pProgress
     */
    onAudioLoadProgress(pProgress) {
        if (this._currentLoadScreen !== undefined) {
            this._currentLoadScreen.onLoadProgress(pProgress);
        }
    }
    /**
     * Called once both audio and PIXI have finished loading assets
     */
    onAllLoadsComplete() {
        if (this._currentLoadScreen !== undefined) {
            this._currentLoadScreen.onLoadComplete(this.onLoadScreenComplete);
        }
        else {
            this.onLoadScreenComplete();
        }
        this.app.broadcast(Topics.LOAD_COMPLETE);
    }
    /**
     * Called when all assets required for the requested state are loaded.
     */
    onLoadScreenComplete() {
        this.log("Requested load complete.");
        if (this._onLoadComplete !== undefined) {
            const callback = this._onLoadComplete;
            this._onLoadComplete = undefined;
            callback();
            // NOTE: The callback might trigger another load, in which case this._onLoadComplete is no longer undefined!
        }
        else {
            this.logE("_onLoadComplete undefined in onLoadScreenComplete");
        }
    }
    /**
     * Called when the load screen is completely hidden.
     */
    onLoadAnimateOutComplete() {
        this.log("Load screen completely hidden.");
        if (this._currentLoadScreen) {
            this.removeChild(this._currentLoadScreen);
            if (!this._isCurrentLoadScreenPersistent) {
                this._currentLoadScreen.destroy();
            }
        }
        this._currentLoadScreen = undefined;
        this.app.broadcast(Topics.LOAD_SCREEN_HIDDEN);
    }
    /**
     * Called when a load is requested.
     * @param pTopic The PubSub message id.
     * @param pToken The data defining the load request.
     */
    onLoadRequested(pTopic, pToken) {
        this.log("Load requested");
        this.load(pToken.assets, pToken.callback);
    }
    /**
     * Called when an unload is requested.
     * @param pTopic The PubSub message id.
     * @param pToken The data defining the unload request.
     */
    onUnloadRequested(pTopic, pToken) {
        this.log("Unload requested");
        this.unload(pToken.assets, pToken.callback);
    }
    /**
     * Logs a message with class name and colour coding if debug flag is true.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    log(pText, ...pParams) {
        if (this._debug) {
            LogUtils.log(pText, { className: "LoadManager", color: "orange" }, ...pParams);
        }
    }
    /**
     * Logs a warning message with class name and colour coding if debug flag is true.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    logW(pText, ...pParams) {
        if (this._debug) {
            LogUtils.logWarning(pText, { className: "LoadManager", color: "orange" }, ...pParams);
        }
    }
    /**
     * Logs an error message with class name and colour coding.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    logE(pText, ...pParams) {
        LogUtils.logError(pText, { className: "LoadManager", color: "orange" }, ...pParams);
    }
}
exports.LoadManager = LoadManager;
//# sourceMappingURL=LoadManager.js.map