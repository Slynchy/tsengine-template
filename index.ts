import { Engine } from "./lib/tsengine";
import { BootAssets } from "./src/config/BootAssets";
import { PIXIConfig } from "./src/config/PIXIConfig";
import { Init } from "./src/game/States/Init";
import { EngineModes } from "./lib/tsengine/engine/Types/EngineModes";

function main(): void {
  const engine: Engine = new Engine(PIXIConfig, EngineModes.PIXI);
  engine.init(
    new Init(),
    BootAssets
  ).then(() => console.log("Engine initialized without errors."));
}

main();
