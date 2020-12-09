import { State, Engine, GameObject, Sprite, Transform } from "../../../lib/tsengine";

export class Init extends State {

    private go: GameObject;
    private rotating: boolean = false;

    public onAwake(_engine: Engine): void {
        _engine.loadWASM("lerp", "./assets/lerp.js").then((): void => {
            const _module: { lerp: Function } = _engine.getWASM("lerp");
            console.log("Result of lerp from WASM: %f", _module.lerp(0, 1, 0.5));
        });

        this.go =
            new GameObject();

        this.go.addComponent(new Sprite(_engine.getTexture("test")));

        this.go.addComponent(
            new Transform(
                {
                    x: (640 / 2),
                    y: (480 / 2)
                },
                1,
                this.go.getComponent(Sprite)
            )
        );

        this.go.getComponent(Transform).setAnchor({x: 0.5, y: 0.5});

        let uuid: string;
        uuid = _engine.getInputManager().registerMouseOverObject(
            (640 / 2) - (_engine.getTexture("test").width / 2),
            (480 / 2) - (_engine.getTexture("test").height / 2),
            _engine.getTexture("test").width,
            _engine.getTexture("test").height,
            null, null, null,
            () => {
                this.rotating = true;
                _engine.getInputManager().removeRegisteredMouseOverObject(uuid);
                uuid = null;
            }
        );

        this.scene.addObject(this.go);
    }

    public onDestroy(_engine: Engine): void {
        this.scene.removeAllObjects();
    }

    public onStep(_engine: Engine): void {
        if (this.rotating) this.go.getComponent(Transform).rotate(_engine.deltaTime / 20);
    }
}
