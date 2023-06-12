import {Example} from "@/state/Example";
import {Interstitial} from "@/state/Interstitial";
import {SplashScreen} from "@/state/SplashScreen";
import * as Constants from "@/utils/Constants";
import {
	Application as HLFApplication,
	AssetMapData,
	AssetType,
	SplashScreen as HLFSplashScreen,
	TextureAsset
} from "html-living-framework";

export default class Application extends HLFApplication {
	static get instance(): Application {
		if (HLFApplication._instance === undefined) {
			HLFApplication._instance = new Application();
		}
		return HLFApplication._instance as Application;
	}

	constructor() {
		super({width: window.innerWidth, height: window.innerHeight});
	}

	async init() {
		super.init();

		this.subscribe<string, { foo?: string }>(
			this.topics.PUSH_KEYBOARD_LAYER,
			(message, data) => {
				console.log(message, data?.foo);
			}
		);
		this.broadcast(this.topics.PUSH_KEYBOARD_LAYER, {foo: "bar"});
	}

	protected createSplashScreen(): HLFSplashScreen {
		return new SplashScreen();
	}

	protected registerLoadingScreens(): void {
		this.load.registerLoadScreen(
			Constants.LOAD_INTERSTITIAL,
			new Interstitial(),
			true
		);
	}

	protected registerStates(): void {
		this.state.register(Constants.STATE_EXAMPLE, () => new Example());
	}

	protected createAssetMap(): void {
		this.addAssetGroup(HLFSplashScreen.NAME, SplashScreen.Assets);
		this.addAssetGroup(Constants.STATE_EXAMPLE, Example.Assets);
	}

	public get requiredAssets(): AssetMapData[] {
		return [
			new TextureAsset("black2x2", AssetType.PNG),
		];
	}

	protected onRequiredAssetsLoaded() {
		super.onRequiredAssetsLoaded();
	}

	public get defaultState(): string {
		return Constants.STATE_EXAMPLE;
	}
}
