import { Container, Point } from "pixi.js";
import { Application } from "../Application";
import { State } from "./State";
import { TransitionStep } from "./TransitionStep";
/**
 * Manages all states.
 * @extends Container
 */
export declare class StateManager extends Container {
    private app;
    /**
     * Cached size of the game.
     */
    private _size;
    /**
     * Flag for state transitions.
     */
    private _isTransitioning;
    /**
     * Dictionary of all registered states.
     */
    private _stateData;
    /**
     * The current active state.
     */
    private _currentState;
    /**
     * The id of the current active state.
     */
    private _currentStateId;
    /**
     * The new state.
     */
    private _newState;
    /**
     * Construction data for the current active state.
     */
    private _currentStateData;
    /**
     * Construction data for the queued next state.
     */
    private _newStateData;
    /**
     * The id of the queued next state. Currently only used for debugging purposes.
     */
    private _queuedStateId;
    /**
     * The current active load screen.
     */
    private _loadScreen;
    /**
     * The current transtion step index.
     */
    private _transitionStepIndex;
    /**
     * The StateToken for the state to transition to.
     */
    private _newStateToken;
    /**
     * Flag for simultaneous state animation race condition check.
     */
    private _simultaneousCheckAnimInComplete;
    /**
     * Flag for simultaneous state animation race condition check.
     */
    private _simultaneousCheckAnimOutComplete;
    /**
     * The internal flag for print log statements.
     */
    private _debug;
    private _defaultStateId?;
    constructor(app: Application);
    get default(): string | undefined;
    /**
     * Enabling this will print all debug logs.
     */
    set debug(pEnabled: boolean);
    /**
     * Updates the current active state.
     * @param pDeltaTime ticker.shared.elapsedMS / 1000.
     */
    update(pDeltaTime: number): void;
    /**
     * Called when the window is resized.
     * @param pSize The new size.
     */
    onResize(pSize: Point): void;
    /**
     * Registers a state so that it can be transitioned to.
     * @param pId The id of the new state.
     * @param pCreate A function that constructs the state.
     */
    register(pId: string, pCreate: () => State): void;
    /**
     * Method to transition states instead of using PubSub variant
     * instead call this.app.state.transitionTo(stateId, loadScreenId)
     * @param pStateIdAndData
     * @param pLoadScreen
     * @param pTransitionSteps
     */
    transitionTo(pStateIdAndData: string, pLoadScreen?: string | undefined, pTransitionSteps?: TransitionStep[]): void;
    /**
     * Transitions to a new state.
     * @param pStateId The new state to transition to.
     * @param [pLoadScreen] The load screen to use.
     */
    private startTransition;
    /**
     * Completes view animate in step if it is in current transition steps.
     */
    private handleViewAnimateInComplete;
    /**
     * Completes view animate out step if it is in current transition steps.
     */
    private handleViewAnimateOutComplete;
    /**
     * Completes load screen animate in step.
     */
    private handleLoadScreenAnimateInComplete;
    /**
     * Completes load screen animate out step.
     */
    private handleLoadScreenAnimateOutComplete;
    /**
     * Completes load assets step if it is in the current transition steps.
     */
    private handleLoadAssetsComplete;
    /**
     * Completes unload assets step.
     */
    private handleUnloadAssetsComplete;
    /**
     * Completes attach new state step if it is in the current transition steps.
     */
    private handleViewReady;
    /**
     * Completes halt step if it is in the current transition steps.
     */
    private handleResumeFromHalt;
    /**
     * Performs the next transition step.
     */
    private performNextTransitionStep;
    /**
     * Perform a transition step at a specific index. If no more steps remain, complete the transition.
     * @param pStepIndex The index of the step to perform.
     */
    private setAndPerformTransitionStep;
    /**
     * Performs a specific transition step.
     * @param pStep The step to perform.
     */
    private performTransitionStep;
    /**
     * Animates in the new state.
     */
    private performStepAnimNewIn;
    /**
     * Animates out the current state.
     */
    private performStepAnimCurrentOut;
    /**
     * Animates in the new state and animates out the current state at the same time.
     */
    private performStepAnimSimultaneously;
    /**
     * Creates, initializes and attaches a new state either in front of or behind other states.
     * @param pNewInFront Should the new view be in front of other states or behind.
     */
    private performStepAttachNewView;
    /**
     * Removes and destroys the current state.
     */
    private performStepRemoveCurrent;
    /**
     * Loads assets required by the new state.
     */
    private performStepLoadAssets;
    /**
     * Unload assets needed for the old state. Any assets already loaded that are needed by the new state will not be
     * unloaded.
     */
    private performStepUnloadAssets;
    /**
     * Copied from ULF but is currently not used.
     * @ignore This.
     */
    private performStepUnloadUnusedAssets;
    /**
     * Shows the current active load screen.
     */
    private performStepShowLoadScreen;
    /**
     * Hides the current active load screen.
     */
    private performStepHideLoadScreen;
    /**
     * Sneds notification for halting transition. Does not call `performNextTransitionStep` automatically.
     */
    private performStepHalt;
    /**
     * Pauses a transition for the duration provided.
     * @param pDuration The duration of the pause.
     */
    private performPause;
    /**
     * Generates a list of assets to unload based on the assets that were loaded in the old state and the assets
     * needed by the new state.
     * @param pOldStateId The id of the state that is leaving.
     * @param pNewStateId The id of the state that is arriving.
     * @returns The list of assets to unload.
     */
    private trimUnloadList;
    /**
     * Generates a list assets to load based on already loaded assets and the assets needed by the new state.
     * @param pNewStateId The id of the state that is arriving.
     * @returns The list of assets to load.
     */
    private trimLoadList;
    /**
     * Creates and returns a new state.
     * @param pStateData The construction data for the state.
     */
    private createState;
    /**
     * Called when a state transition is requested.
     * @param pTopic The PubSub message id.
     * @param pToken The data defining the state transition.
     */
    private onStateLoadRequested;
    /**
     * Logs a message with class name and colour coding if debug flag is true.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    private log;
    /**
     * Logs a warning message with class name and colour coding if debug flag is true.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    private logW;
    /**
     * Logs an error message with class name and colour coding.
     * @param pText The message to print.
     * @param [pParams] Optional data to be included in the message.
     * @todo Relish GM => Decide if this should live in its own class, be in an interface or within each manager.
     */
    private logE;
}
//# sourceMappingURL=StateManager.d.ts.map