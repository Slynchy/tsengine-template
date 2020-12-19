import { Ability } from "../Logic/Abilities/Ability";
import { Punch } from "../Logic/Abilities/Punch";

enum DIRECTION {
    left = -1,
    right = 1
}

export class Character { // fixme: temp
    public name: string;
    public health: number;
    public direction: DIRECTION;
    public abilities: Ability[];
    public ultimatePercent: number;
}

export interface IPlayerState {
    playerCharacter: Character;
}

export const PLAYER_STATE: IPlayerState = {
    playerCharacter: {
        health: 100,
        name: "Sma",
        direction: DIRECTION.right,
        ultimatePercent: 0,
        abilities: [
            new Punch()
        ]
    }
};
