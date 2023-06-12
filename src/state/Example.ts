import {ExampleBase} from "@/state/ExampleBase.ts";
import {AssetMapData} from "html-living-framework";
import {Point} from "pixi.js";

export class Example extends ExampleBase {
	public constructor() {
		super();
	}

	public init(pSize: Point) {
		super.init(pSize);
		this.setHeaderText("Example");
		this.setMainText("Add some instructions for the example here.");
	}

	public static get Assets(): AssetMapData[] {
		return []
	}
}
