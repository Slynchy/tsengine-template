import { Ability } from "./Ability";
import * as PIXI from "pixi.js";
import { Character } from "../../Globals/PlayerState";
import { HelperFunctions, Sprite, Vec2 } from "../../../../lib/tsengine";

let cachedRangeImage: PIXI.Graphics;

export class Punch extends Ability {
    public name: string = "Punch";
    public description: string = "Punching a robot never sounded like a better idea";
    public damageString: string = "20 Flesh dmg, 10 self-dmg";
    public abilityIconKey: string = "punch_icon";
    public mpCost: number = 20;
    public getAttackRange(): {[key: number]: {[key: number]: boolean}} {
        return {
            1: {0: true}
        };
    }
    public createRangeImage(): PIXI.Graphics {
        if(!cachedRangeImage) {
            cachedRangeImage = new PIXI.Graphics();
            cachedRangeImage.lineStyle(2, 0xFF0000, 1, 0.5);

            // base red grid
            for(let x: number = 0; x < 3; x++) {
                for(let y: number = 0; y < 3; y++) {
                    cachedRangeImage.drawRect(25 * x, 25 * y, 25, 25);
                }
            }

            // center tile
            cachedRangeImage.lineStyle(2, 0x00FF00, 1, 0.5);
            cachedRangeImage.beginFill(0x00FF00);
            cachedRangeImage.drawRect(25 * 1, 25 * 1, 25, 25);
            cachedRangeImage.endFill();

            // tile in front
            cachedRangeImage.lineStyle(2, 0xFF7700, 1, 0.5);
            cachedRangeImage.beginFill(0xFF7700);
            cachedRangeImage.drawRect(25 * 2, 25 * 1, 25, 25);
            cachedRangeImage.endFill();
        }
        return cachedRangeImage;
    }

    public applyAttack(attacker: Character, defender: Character): void {
        defender.health -= 20;
        attacker.health -= 10; // todo: check if race == robot
    }

    public isInRange(src: Vec2, dest: Vec2): boolean {
        return dest.x === src.x + (1 * 1 /* handle direction here */) && dest.y === src.y;
    }

    public doAttackAnimation(attacker: Sprite, defender: Sprite): Promise<void> {
        return new Promise<void>( async (resolve: Function): Promise<void> => {
            const cachePos: Vec2 = {
                x: attacker.x,
                y: attacker.y
            };
            // @ts-ignore
            const lerp: Function = window.ENGINE.getWASM("lerp").lerp;
            await HelperFunctions.lerpToPromise(attacker as unknown as Vec2, {
                    x: cachePos.x - 33,
                    y: cachePos.y
                }, 0.01, lerp);
            await HelperFunctions.lerpToPromise(attacker as unknown as Vec2, {
                    x: defender.x,
                    y: cachePos.y
                }, 0.25, lerp);
            attacker.x = cachePos.x;
            attacker.y = cachePos.y;
            resolve();
        });
    }
}
