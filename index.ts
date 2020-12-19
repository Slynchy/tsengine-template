import { Engine } from "./lib/tsengine";
import { BootAssets } from "./src/config/BootAssets";
import { PIXIConfig } from "./src/config/PIXIConfig";
import { Init } from "./src/game/States/Init";
import { EngineModes } from "./lib/tsengine/engine/Types/EngineModes";
import { PLAYER_STATE } from "./src/game/Globals/PlayerState";
import { BattleScene } from "./src/game/States/BattleScene";

function main(): void {
  const engine: Engine = new Engine(PIXIConfig, EngineModes.PIXI);

  engine.loadWASM("lerp", "./assets/lerp.js")
      .then((): Promise<void> => {
        // const _module: { lerp: Function } = engine.getWASM("lerp");
        // console.log("Result of lerp from WASM: %f", _module.lerp(0, 1, 0.5));
        return engine.init(
            new BattleScene(engine),
            BootAssets
        ).then(() => console.log("Engine initialized without errors."));
      });
}

main();
