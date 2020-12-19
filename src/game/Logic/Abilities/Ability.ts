import * as PIXI from "pixi.js";
import { Character } from "../../Globals/PlayerState";
import { Sprite, Vec2 } from "../../../../lib/tsengine";

type integer = number;

export abstract class Ability {
    public abstract name: string;
    public abstract description: string;
    public abstract damageString: string;
    public abstract abilityIconKey: string;
    public abstract mpCost: integer;
    public abstract createRangeImage(): PIXI.Graphics;
    public abstract getAttackRange(): {[key: number]: {[key: number]: boolean}};
    public abstract applyAttack(attacker: Character, defender: Character): void;
    public abstract isInRange(src: Vec2, dest: Vec2): boolean;
    public abstract doAttackAnimation(attacker: Sprite, defender: Sprite): Promise<void>;
}
