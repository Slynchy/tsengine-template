import { Engine } from "tsengine";
import { BootAssets } from "./src/config/BootAssets";
import { PIXIConfig } from "./src/config/PIXIConfig";
import { Init } from "./src/game/States/Init";

function main(): void {
  const engine: Engine = new Engine(PIXIConfig);
  engine.init(
    new Init(),
    BootAssets
  ).then(() => console.log("Engine initialized without errors."));
}

main();
