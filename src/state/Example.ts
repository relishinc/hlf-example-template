import {GREEN} from "@/utils/Constants.ts";
import {gsap} from "gsap";
import {AssetMapData, AssetType, BodyType, ObjectOrArrayXY, State, TextureAsset} from "html-living-framework";
import {Container, Point, Sprite, Text} from "pixi.js";

export class Example extends State {
    private _bg: Sprite;
    private _mainTitle: Text;
    private _title: Text;
    private _footerTitle: Text;
    private _physicsContainer: Container;


    public constructor() {
        super();
    }

    public init(pSize: Point) {
        super.init(pSize);

        // add the bg first so it's always at the bottom
        this._bg = this.add.coloredSprite(GREEN);
        this._bg.eventMode = "static"

        this._physicsContainer = this.add.container();

        // add the layout
        this.createLayout()

        this.layout.alpha = 0;

        const header = this.getLayoutById("header")
        const main = this.getLayoutById("main")
        const footer = this.getLayoutById("footer")

        header.setStyles({
            fontFamily: "arboria",
            height: 80,
            paddingLeft: 25,
            paddingTop: 8,
            fontSize: 54,
            color: "white",
            background: "rgba(0,0,0,0.05)"
        });

        footer.setStyles({
            fontFamily: "arboria",
            paddingRight: 20,
            paddingBottom: 10,
            fontSize: 14,
            color: "white",
        });

        main.setStyles({
            fontFamily: "arboria",
            paddingRight: 10,
            paddingBottom: 10,
            fontSize: 18,
            color: "white",
            opacity: 0.2,
            textAlign: "center",
            verticalAlign: "middle",
            align: "center",
        });

        this._title = this.make.text("Matter Physics Example", {fontFamily: "arboria", fill: 0xffffff});
        header.addContent(this._title);
        this._title.alpha = 0;

        this._footerTitle = this.make.text(`Ⓒ ${new Date().getFullYear()} Relish Digital`, {
            fontFamily: "arboria",
            fill: 0xffffff,
            fontSize: 14
        });
        this._footerTitle.alpha = 0;

        this._mainTitle = this.make.text("Click anywhere to add a physics enabled sprite.\nPress the 'D' key to toggle debug mode.", {
            fontFamily: "arboria",
            fill: 0xffffff,
            fontSize: 14,
            align: "center",
        });
        this._mainTitle.alpha = 0;
        main.addContent(this._mainTitle);

        footer.addContent(this._footerTitle);

        this.eventMode = "static";
    }

    public async animateIn(pOnComplete: () => void): Promise<void> {
        const timeline = gsap.timeline();
        await timeline.to(this.layout, {
            alpha: 1,
            duration: 0.5
        }).fromTo(this.getLayoutById("header"), {y: -200}, {
            y: 0,
            duration: 0.4, ease: "sine.out"
        }).fromTo([this._title, this._mainTitle, this._footerTitle], {alpha: 0}, {
            duration: 0.4,
            alpha: 1,
            stagger: 0.1
        })

        await this.startPhysics();

        pOnComplete();
    }

    private async startPhysics() {
        // start physics
        this.app.addPhysics();
        await this.app.physics.init(true, true);

        const gfx = this.make.graphics();

        this.on("pointerdown", (e) => {
            const pt = e.getLocalPosition(this);
            const type = Math.random() > 0.5 ? BodyType.CIRCLE : BodyType.RECTANGLE;
            const size: ObjectOrArrayXY = type === BodyType.CIRCLE ? Math.random() * 50 + 50 : [Math.random() * 50 + 50,
                Math.random() * 50 + 50];

            // make a random colored texture from graphics
            gfx.clear();
            gfx.beginFill(Math.floor(Math.random() * 0xffffff));
            if (type === BodyType.CIRCLE) {
                gfx.drawCircle(0, 0, (size as number) * 0.5);
            } else {
                gfx.drawRect(0, 0, (size as [number, number])[0], (size as [number, number])[1]);
            }
            gfx.endFill();

            this.add.physicsSprite(this.app.renderer.generateTexture(gfx), undefined, size, type, 1, pt);
        });

        window.addEventListener("keyup", (e) => {
            // if the D key is pressed, toggle debug mode
            if (e.key === "d") {
                this.app.physics.debug = !this.app.physics.debug;
            }
        })
    }

    public async animateOut(pOnComplete: () => void): Promise<void> {
        const timeline = gsap.timeline();
        await timeline.to(this, {
            duration: 0.5,
            alpha: 0,
        });
        pOnComplete();
    }

    public onResize(pSize: Point) {
        super.onResize(pSize);
        if (this._bg) {
            this._bg.width = this._size.x;
            this._bg.height = this._size.y;
        }
    }

    public destroy() {
        super.destroy()
    }

    public static get Assets(): AssetMapData[] {
        return [new TextureAsset("black2x2", AssetType.PNG)]
    }
}
