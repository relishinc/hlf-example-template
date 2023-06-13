import {ExampleBase} from "@/state/ExampleBase";
import {AssetMapData} from "html-living-framework";
import {Point} from "pixi.js";

export class Example extends ExampleBase {
	public constructor() {
		super();
	}

	public init(pSize: Point) {
		super.init(pSize);
		// write some code here for this example
	}

	public static get Assets(): AssetMapData[] {
		return [];
	}
}
