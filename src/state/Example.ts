import { ExampleBase } from "@/state/ExampleBase";
import { AssetMapData, BodyType } from "html-living-framework";
import { Point } from "pixi.js";

export class Example extends ExampleBase {
  public constructor() {
    super();
  }

  public init(pSize: Point) {
    super.init(pSize);
    this.setHeaderText("Matter Physics Example");
    this.setMainText(
      "Click anywhere to add a physics enabled sprite.\nPress the 'D' key to toggle debug mode."
    );

    this.startPhysics();
  }

  protected getObjectSize() {
    return Math.random() * 50 + 50;
  }

  protected async startPhysics() {
    this.app.addPhysics();
    await this.app.physics.init(true, true);
    const gfx = this.make.graphics();

    // if the D key is pressed, toggle debug mode
    window.addEventListener("keyup", (e) => {
      if (e.key === "d") {
        this.app.physics.debug = !this.app.physics.debug;
      }
    });

    // on pointer down, add a random colored rect or circle
    this.eventMode = "static";
    this.on("pointerdown", (e) => {
      const pt = e.getLocalPosition(this);
      const type = Math.random() > 0.5 ? BodyType.CIRCLE : BodyType.RECTANGLE;
      const size: [number, number?] | number =
        type === BodyType.CIRCLE
          ? this.getObjectSize()
          : [this.getObjectSize(), this.getObjectSize()];

      // make a random colored texture from graphics
      gfx.clear();
      gfx.beginFill(Math.floor(Math.random() * 0xffffff));
      if (type === BodyType.CIRCLE) {
        gfx.drawCircle(0, 0, (size as number) * 0.5);
      } else {
        gfx.drawRect(
          0,
          0,
          (size as [number, number])[0],
          (size as [number, number])[1]
        );
      }
      gfx.endFill();

      this.add.physicsSprite(
        this.app.renderer.generateTexture(gfx),
        undefined,
        size,
        type,
        1,
        pt
      );
    });
  }

  public static get Assets(): AssetMapData[] {
    return [];
  }
}
