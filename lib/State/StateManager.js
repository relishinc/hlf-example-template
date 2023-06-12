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
exports.StateManager = void 0;
const gsap_1 = require("gsap");
const pixi_js_1 = require("pixi.js");
const typescript_collections_1 = require("typescript-collections");
const Application_1 = require("../Application");
const Data_1 = require("../Data");
const Topics = __importStar(require("../Data/Topics"));
const Load_1 = require("../Load");
const LogUtils = __importStar(require("../Utils/LogUtils"));
const StateToken_1 = require("./StateToken");
const TransitionStep_1 = require("./TransitionStep");
const TransitionType = __importStar(require("./TransitionType"));
/**
 * Manages all states.
 * @extends Container
 */
class StateManager extends pixi_js_1.Container {
    constructor(app) {
        super();
        this.app = app;
        /**
         * The id of the current active state.
         */
        this._currentStateId = "undefined";
        /**
         * The id of the queued next state. Currently only used for debugging purposes.
         */
        this._queuedStateId = "undefined";
        /**
         * The internal flag for print log statements.
         */
        this._debug = false;
        this._size = new pixi_js_1.Point();
        this._stateData = new typescript_collections_1.Dictionary();
        this._isTransitioning = false;
        this._simultaneousCheckAnimInComplete = false;
        this._simultaneousCheckAnimOutComplete = false;
        this._transitionStepIndex = 0;
        this._defaultStateId = this.app.defaultState;
        this.onStateLoadRequested = this.onStateLoadRequested.bind(this);
        this.app.subscribe(Topics.STATE_LOAD_STATE, this.onStateLoadRequested);
    }
    get default() {
        return this._defaultStateId;
    }
    /**
     * Enabling this will print all debug logs.
     */
    set debug(pEnabled) {
        this._debug = pEnabled;
    }
    /**
     * Updates the current active state.
     * @param pDeltaTime ticker.shared.elapsedMS / 1000.
     */
    update(pDeltaTime) {
        if (this._currentState !== undefined) {
            this._currentState.update(pDeltaTime);
        }
    }
    /**
     * Called when the window is resized.
     * @param pSize The new size.
     */
    onResize(pSize) {
        this._size.copyFrom(pSize);
        if (this._currentState !== undefined) {
            this._currentState.onResize(this._size);
        }
    }
    /**
     * Registers a state so that it can be transitioned to.
     * @param pId The id of the new state.
     * @param pCreate A function that constructs the state.
     */
    register(pId, pCreate) {
        this._stateData.setValue(pId, { create: pCreate });
    }
    transitionTo(pStateIdAndData, pLoadScreen, pTransitionSteps) {
        const stateObj = pStateIdAndData;
        const stateStr = pStateIdAndData;
        if (!pTransitionSteps) {
            pTransitionSteps = TransitionType.TRANSITION_FIRST_VIEW;
        }
        let token;
        if (stateObj === null || stateObj === void 0 ? void 0 : stateObj.id) {
            token = new StateToken_1.StateToken(stateObj, pLoadScreen, ...pTransitionSteps);
        }
        else {
            token = new StateToken_1.StateToken(stateStr, pLoadScreen, ...pTransitionSteps);
        }
        this._newStateToken = token;
        this.startTransition(token.stateId, token.loadScreen);
    }
    /**
     * Transitions to a new state.
     * @param pStateId The new state to transition to.
     * @param [pLoadScreen] The load screen to use.
     */
    startTransition(pStateId, pLoadScreen) {
        this.log("Transition requested from %c%s %cto %c%s.", LogUtils.STYLE_RED_BOLD, this._currentStateId, LogUtils.STYLE_BLACK, LogUtils.STYLE_RED_BOLD, pStateId);
        if (this._isTransitioning) {
            this.logW("Transition already in progress, transition to (%s) ignored", pStateId);
            return;
        }
        const data = this._stateData.getValue(pStateId);
        if (data === undefined) {
            this.logE("%c%s%c has not been registered as a state. Please include it in your registerState " +
                "implementation.", LogUtils.STYLE_RED_BOLD, pStateId, LogUtils.STYLE_BLACK);
            return;
        }
        this._isTransitioning = true;
        this._queuedStateId = pStateId;
        this._newStateData = data;
        this._loadScreen = pLoadScreen;
        // Start transition
        this.setAndPerformTransitionStep(0);
    }
    /**
     * Completes view animate in step if it is in current transition steps.
     */
    handleViewAnimateInComplete() {
        this.log("handleViewAnimateInComplete");
        let step;
        if (this._newStateToken !== undefined) {
            step = this._newStateToken.transitionSteps[this._transitionStepIndex];
            switch (step) {
                case TransitionStep_1.TransitionStep.AnimNewIn:
                    this.performNextTransitionStep();
                    break;
                case TransitionStep_1.TransitionStep.AnimSimultaneously:
                    this._simultaneousCheckAnimInComplete = true;
                    // This is a race condition.  Ensure current view is fully animated out and new one is animated in.
                    if (this._simultaneousCheckAnimInComplete &&
                        this._simultaneousCheckAnimOutComplete) {
                        this.performNextTransitionStep();
                    }
                    break;
            }
        }
    }
    /**
     * Completes view animate out step if it is in current transition steps.
     */
    handleViewAnimateOutComplete() {
        this.log("handleViewAnimateOutComplete");
        let step;
        if (this._newStateToken !== undefined) {
            step = this._newStateToken.transitionSteps[this._transitionStepIndex];
            switch (step) {
                case TransitionStep_1.TransitionStep.AnimCurrentOut:
                    this.performNextTransitionStep();
                    break;
                case TransitionStep_1.TransitionStep.AnimSimultaneously:
                    this._simultaneousCheckAnimOutComplete = true;
                    // This is a race condition.  Ensure current view is fully animated out and new one is animated in.
                    if (this._simultaneousCheckAnimInComplete &&
                        this._simultaneousCheckAnimOutComplete) {
                        this.performNextTransitionStep();
                    }
                    break;
            }
        }
    }
    /**
     * Completes load screen animate in step.
     */
    handleLoadScreenAnimateInComplete() {
        this.log("handleLoadScreenAnimateInComplete");
        // Ready for next step.
        this.performNextTransitionStep();
    }
    /**
     * Completes load screen animate out step.
     */
    handleLoadScreenAnimateOutComplete() {
        this.log("handleLoadScreenAnimateOutComplete");
        // Ready for next step.
        this.performNextTransitionStep();
    }
    /**
     * Completes load assets step if it is in the current transition steps.
     */
    handleLoadAssetsComplete() {
        this.log("handleLoadAssetsComplete");
        // Ignore these notifications if not waiting for anything.
        // That's the case for initial load on Splash View.
        if (this._newStateToken !== undefined &&
            this._newStateToken.transitionSteps.length > 0 &&
            this._newStateToken.transitionSteps[this._transitionStepIndex] ===
                TransitionStep_1.TransitionStep.LoadAssets) {
            // Ready for next step.
            this.performNextTransitionStep();
        }
    }
    /**
     * Completes unload assets step.
     */
    handleUnloadAssetsComplete() {
        this.log("handleUnloadAssetsComplete");
        this.performNextTransitionStep();
    }
    /**
     * Completes attach new state step if it is in the current transition steps.
     */
    handleViewReady(pToken) {
        this.log("handleViewReady");
        let step;
        if (this._newStateToken !== undefined) {
            step = this._newStateToken.transitionSteps[this._transitionStepIndex];
            switch (step) {
                case TransitionStep_1.TransitionStep.AttachNewInFront:
                case TransitionStep_1.TransitionStep.AttachNewBehind:
                    this.performNextTransitionStep();
                    break;
            }
        }
    }
    /**
     * Completes halt step if it is in the current transition steps.
     */
    handleResumeFromHalt() {
        this.log("handleResumeFromHalt");
        let step;
        if (this._newStateToken !== undefined) {
            step = this._newStateToken.transitionSteps[this._transitionStepIndex];
            switch (step) {
                case TransitionStep_1.TransitionStep.Halt:
                    this.performNextTransitionStep();
                    break;
            }
        }
    }
    /**
     * Performs the next transition step.
     */
    performNextTransitionStep() {
        this.log("performNextTransitionStep");
        this.setAndPerformTransitionStep(this._transitionStepIndex + 1);
    }
    /**
     * Perform a transition step at a specific index. If no more steps remain, complete the transition.
     * @param pStepIndex The index of the step to perform.
     */
    setAndPerformTransitionStep(pStepIndex) {
        this.log("setAndPerformTransitionStep");
        let step;
        this._transitionStepIndex = pStepIndex;
        this.log("Step index %s out of %s steps", pStepIndex, this._newStateToken.transitionSteps.length);
        if (this._transitionStepIndex < this._newStateToken.transitionSteps.length) {
            step = this._newStateToken.transitionSteps[this._transitionStepIndex];
            this.performTransitionStep(step);
        }
        else {
            this.log("%cNO MORE STEPS", LogUtils.STYLE_PINK_DARK);
            // No more steps to execute
            this._currentState = this._newState;
            this._currentStateData = this._newStateData;
            this._currentStateId = this._newStateToken.stateId;
            this._newStateToken = undefined;
            this._newState = undefined;
            this._newStateData = undefined;
            this._transitionStepIndex = 0;
            this._isTransitioning = false;
            this._simultaneousCheckAnimInComplete = false;
            this._simultaneousCheckAnimOutComplete = false;
        }
    }
    /**
     * Performs a specific transition step.
     * @param pStep The step to perform.
     */
    performTransitionStep(pStep) {
        this.log("performTransitionStep(%c%s%c)", LogUtils.STYLE_BLUE_BOLD, TransitionStep_1.TransitionStep[pStep], LogUtils.STYLE_BLACK);
        switch (pStep) {
            case TransitionStep_1.TransitionStep.AnimNewIn:
                this.performStepAnimNewIn();
                break;
            case TransitionStep_1.TransitionStep.AnimCurrentOut:
                this.performStepAnimCurrentOut();
                break;
            case TransitionStep_1.TransitionStep.AnimSimultaneously:
                this.performStepAnimSimultaneously();
                break;
            case TransitionStep_1.TransitionStep.AttachNewInFront:
                this.performStepAttachNewView(true);
                break;
            case TransitionStep_1.TransitionStep.AttachNewBehind:
                this.performStepAttachNewView(false);
                break;
            case TransitionStep_1.TransitionStep.RemoveCurrent:
                this.performStepRemoveCurrent();
                break;
            case TransitionStep_1.TransitionStep.LoadAssets:
                this.performStepLoadAssets();
                break;
            case TransitionStep_1.TransitionStep.UnloadAssets:
                this.performStepUnloadAssets();
                break;
            case TransitionStep_1.TransitionStep.UnloadUnusedAssets:
                this.performStepUnloadUnusedAssets();
                break;
            case TransitionStep_1.TransitionStep.ShowLoadScreen:
                this.performStepShowLoadScreen();
                break;
            case TransitionStep_1.TransitionStep.HideLoadScreen:
                this.performStepHideLoadScreen();
                break;
            case TransitionStep_1.TransitionStep.Halt:
                this.performStepHalt();
                break;
            case TransitionStep_1.TransitionStep.PauseAFrame:
                this.performPause(0.1);
                break;
            case TransitionStep_1.TransitionStep.Pause1Second:
                this.performPause(1);
                break;
            case TransitionStep_1.TransitionStep.Pause5Seconds:
                this.performPause(5);
                break;
            default:
                break;
        }
    }
    /**
     * Animates in the new state.
     */
    performStepAnimNewIn() {
        this.log("performStepAnimNewIn");
        if (this._newState === undefined) {
            this.logE("The new view is null. Ensure step %s or %s is performed before this one.", TransitionStep_1.TransitionStep.AttachNewInFront, TransitionStep_1.TransitionStep.AttachNewBehind);
            this.performNextTransitionStep();
        }
        else {
            this._newState.animateIn(this.handleViewAnimateInComplete.bind(this));
        }
    }
    /**
     * Animates out the current state.
     */
    performStepAnimCurrentOut() {
        this.log("performStepAnimCurrentOut");
        if (this._currentState === undefined) {
            this.logE("The current view is null. Review your transition steps.");
            this.performNextTransitionStep();
        }
        else {
            this._currentState.animateOut(this.handleViewAnimateOutComplete.bind(this));
        }
    }
    /**
     * Animates in the new state and animates out the current state at the same time.
     */
    performStepAnimSimultaneously() {
        this.log("performStepAnimSimultaneously");
        // These flags will be used to handle the race condition between current view animating out
        // and new one animating in.
        this._simultaneousCheckAnimInComplete = false;
        this._simultaneousCheckAnimOutComplete = false;
        if (this._newState === undefined) {
            this.logE("The new view is null. Ensure step %s or %s is performed before this one.", TransitionStep_1.TransitionStep.AttachNewInFront, TransitionStep_1.TransitionStep.AttachNewBehind);
            this._simultaneousCheckAnimInComplete = true;
        }
        else {
            // Animate in the new view and wait for its callback
            this._newState.animateIn(this.handleViewAnimateInComplete.bind(this));
        }
        if (this._currentState === undefined) {
            this.logE("The current view is null. Review your transition steps.");
            this._simultaneousCheckAnimOutComplete = true;
        }
        else {
            // Animate out the current view and wait for its callback
            this._currentState.animateOut(this.handleViewAnimateOutComplete.bind(this));
        }
        // The unlikely case that there's neither a new view to animate in or current to animate out.
        // The error/warning is already reported above
        if (this._simultaneousCheckAnimInComplete &&
            this._simultaneousCheckAnimOutComplete) {
            this.performNextTransitionStep();
        }
    }
    /**
     * Creates, initializes and attaches a new state either in front of or behind other states.
     * @param pNewInFront Should the new view be in front of other states or behind.
     */
    performStepAttachNewView(pNewInFront) {
        this.log("performStepAttachNewView");
        const d = new Date();
        this.log("(%s)\n --- current view: '%s' @ time %s with %s milliseconds", this._newStateToken.stateId, this._currentStateId, d.toLocaleTimeString(), d.getMilliseconds());
        if (this._newState !== undefined) {
            this.logE("New view already exists. Review your transition steps.");
            this.performNextTransitionStep();
        }
        else {
            this._newState = this.createState(this._newStateData);
            // Attach state as child of manager.
            this.addChild(this._newState);
            this._newState.init(this._size, this._newStateToken.data);
            this.app.broadcast(Data_1.STATE_INIT, this._newStateToken.data);
            // Caller requests the new view to be added in front or behind the existing view.
            if (pNewInFront) {
                this.log("Attaching %c%s%c in %cfront.", LogUtils.STYLE_RED_BOLD, this._newStateToken.stateId, LogUtils.STYLE_BLACK, LogUtils.STYLE_BLUE_BOLD);
                this.setChildIndex(this._newState, this.children.length - 1);
            }
            else {
                this.log("Attaching %c%s%c %cbehind.", LogUtils.STYLE_RED_BOLD, this._newStateToken.stateId, LogUtils.STYLE_BLACK, LogUtils.STYLE_BLUE_BOLD);
                this.setChildIndex(this._newState, 0);
            }
            /**
             * @todo Relish GM => Should we send a view ready notification?
             */
            // Notify the world that a view has been added.
            // _mediator.NotifyViewAdded(_newViewToken);
            // Wait for ViewReady notification.
            this.handleViewReady(this._newStateToken);
        }
    }
    /**
     * Removes and destroys the current state.
     */
    performStepRemoveCurrent() {
        this.log("performStepRemoveCurrent");
        if (this._currentState === undefined) {
            this.logE("The current view is null. Review your transition steps.");
            this.performNextTransitionStep();
        }
        else {
            // Remove from stage.
            this.removeChild(this._currentState);
            // State will not be reused so destroy it.
            this._currentState.destroy({ children: true });
            // Notify the world when a view is removed.
            // _mediator.NotifyViewRemoved(_currentView.Token);
            this._currentState = undefined;
            delete this._currentState;
            this.log("Current %c%s%c removed.", LogUtils.STYLE_RED_BOLD, this._currentStateId, LogUtils.STYLE_BLACK);
            // Ready to perform next step.
            this.performNextTransitionStep();
        }
    }
    /**
     * Loads assets required by the new state.
     */
    performStepLoadAssets() {
        this.log("performStepLoadAssets");
        let assetsToLoad;
        assetsToLoad = this.trimLoadList(this._newStateToken.stateId);
        if (assetsToLoad.length > 0) {
            // Load all assets via the LoadManager
            const token = new Load_1.LoadToken(assetsToLoad, this.handleLoadAssetsComplete.bind(this), this._loadScreen);
            this.app.broadcast(Topics.LOAD_ASSETS, token);
        }
        else {
            // No assets to load.
            this.logW("No new assets to load found for %c%s%c. Advancing transition.", LogUtils.STYLE_RED_BOLD, this._newStateToken.stateId, LogUtils.STYLE_BLACK);
            this.performNextTransitionStep();
        }
    }
    /**
     * Unload assets needed for the old state. Any assets already loaded that are needed by the new state will not be
     * unloaded.
     */
    performStepUnloadAssets() {
        this.log("performStepUnloadAssets");
        // Get list of assets used by the old view
        const assets = this.trimUnloadList(this._currentStateId, this._newStateToken.stateId);
        if (assets !== undefined) {
            if (assets.length > 0) {
                const token = new Load_1.LoadToken(assets, this.handleUnloadAssetsComplete.bind(this), this._loadScreen);
                this.app.broadcast(Topics.UNLOAD_ASSETS, token);
            }
            else {
                // No assets to unload
                this.performNextTransitionStep();
            }
        }
        else {
            // No assets to unload
            this.performNextTransitionStep();
        }
    }
    /**
     * Copied from ULF but is currently not used.
     * @ignore This.
     */
    performStepUnloadUnusedAssets() {
        this.log("performStepUnloadUnusedAssets");
        // Not used
        this.performNextTransitionStep();
    }
    /**
     * Shows the current active load screen.
     */
    performStepShowLoadScreen() {
        this.log("performStepShowLoadScreen");
        if (this._loadScreen !== undefined) {
            this.app.broadcast(Topics.SHOW_LOAD_SCREEN, {
                callback: this.handleLoadScreenAnimateInComplete.bind(this),
                loadScreen: this._loadScreen,
                stateData: this._newStateToken !== undefined
                    ? this._newStateToken.data
                    : undefined,
                firstLoad: false,
            });
        }
        else {
            this.logE("Load screen show requested with %c%s%c passed in. Please specify a registered load screen to" +
                " use.", LogUtils.STYLE_RED_BOLD, this._loadScreen, LogUtils.STYLE_BLACK);
        }
    }
    /**
     * Hides the current active load screen.
     */
    performStepHideLoadScreen() {
        this.log("performStepHideLoadScreen");
        if (this._loadScreen !== undefined) {
            this.app.broadcast(Topics.HIDE_LOAD_SCREEN, {
                callback: this.handleLoadScreenAnimateOutComplete.bind(this),
                loadScreen: this._loadScreen,
            });
        }
        else {
            this.logE("Load screen show requested with %c%s%c passed in. Please specify a registered load screen to" +
                " use.", LogUtils.STYLE_RED_BOLD, this._loadScreen, LogUtils.STYLE_BLACK);
        }
    }
    /**
     * Sneds notification for halting transition. Does not call `performNextTransitionStep` automatically.
     */
    performStepHalt() {
        this.log("performStepHalt");
        this.app.broadcast(Topics.STATE_TRANSITION_HALTED, this._newStateToken);
    }
    /**
     * Pauses a transition for the duration provided.
     * @param pDuration The duration of the pause.
     */
    performPause(pDuration) {
        this.log("performPause");
        gsap_1.gsap.delayedCall(pDuration, this.performNextTransitionStep.bind(this));
    }
    /**
     * Generates a list of assets to unload based on the assets that were loaded in the old state and the assets
     * needed by the new state.
     * @param pOldStateId The id of the state that is leaving.
     * @param pNewStateId The id of the state that is arriving.
     * @returns The list of assets to unload.
     */
    trimUnloadList(pOldStateId, pNewStateId) {
        const oldAssets = Load_1.AssetMap.getAssetGroup(pOldStateId);
        const newAssets = Load_1.AssetMap.getAssetGroup(pNewStateId);
        const requiredAssets = Application_1.Application.instance.requiredAssets;
        // Concatenate the arrays so we only loop through oldAssets once
        const assetsToKeep = requiredAssets
            .map((a) => a.assetName)
            .concat(...newAssets.map((a) => a.assetName));
        // Comparing just the assetNames means we can use Array.indexOf
        const assetsToUnload = oldAssets.filter((a) => assetsToKeep.indexOf(a.assetName) < 0);
        if (this._debug) {
            assetsToUnload.forEach((asset) => {
                this.log("Added %c%s%c to unload list", LogUtils.STYLE_RED_BOLD, asset.assetName, LogUtils.STYLE_BLACK);
            });
        }
        return assetsToUnload;
    }
    /**
     * Generates a list assets to load based on already loaded assets and the assets needed by the new state.
     * @param pNewStateId The id of the state that is arriving.
     * @returns The list of assets to load.
     */
    trimLoadList(pNewStateId) {
        const newAssets = Load_1.AssetMap.getAssetGroup(pNewStateId);
        const assetsToLoad = new Array();
        for (const asset of newAssets) {
            if (!asset.isLoaded()) {
                assetsToLoad.push(asset);
            }
        }
        return assetsToLoad;
    }
    /**
     * Creates and returns a new state.
     * @param pStateData The construction data for the state.
     */
    createState(pStateData) {
        let state;
        state = pStateData.create();
        return state;
    }
    /**
     * Called when a state transition is requested.
     * @param pTopic The PubSub message id.
     * @param pToken The data defining the state transition.
     */
    onStateLoadRequested(pTopic, pToken) {
        this._newStateToken = pToken;
        this.startTransition(pToken.stateId, pToken.loadScreen);
    }
    /**
     * Logs a message with class name and colour coding if debug flag is true.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    log(pText, ...pParams) {
        if (this._debug) {
            LogUtils.log(pText, { className: "StateManager", color: LogUtils.COLOR_RELISH }, ...pParams);
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
            LogUtils.logWarning(pText, { className: "StateManager", color: LogUtils.COLOR_RELISH }, ...pParams);
        }
    }
    /**
     * Logs an error message with class name and colour coding.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    logE(pText, ...pParams) {
        LogUtils.logError(pText, { className: "StateManager", color: LogUtils.COLOR_RELISH }, ...pParams);
    }
}
exports.StateManager = StateManager;
//# sourceMappingURL=StateManager.js.map