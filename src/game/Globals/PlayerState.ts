import { Ability } from "../Logic/Abilities/Ability";
import { Punch } from "../Logic/Abilities/Punch";

export enum DIRECTION {
    left = -1,
    right = 1
}

export enum DIALOGUE_TYPE {
    THOUGHT,
    SPEECH
}

export enum DIALOGUE_EVENTS {
    ON_ATTACK,
    TURN_START,
    ATTACKED
}

interface IDialogueLine {
    type: DIALOGUE_TYPE;
    text: string;
    event: DIALOGUE_EVENTS;
}

export class Character { // fixme: temp
    public uuid: string;
    public name: string;
    public health: number;
    public mp: number;
    public direction: DIRECTION;
    public abilities: Ability[];
    public availableDialogueLines: IDialogueLine[];
    public ultimatePercent: number;
}

export interface IPlayerState {
    playerCharacter: Character;
}

export const PLAYER_STATE: IPlayerState = {
    playerCharacter: {
        uuid: Math.random().toString().slice(2),
        health: 100,
        mp: 100,
        name: "Sma",
        direction: DIRECTION.right,
        ultimatePercent: 0,
        availableDialogueLines: [
            {
                type: DIALOGUE_TYPE.SPEECH,
                text: "GO AWAY, YOU EVIL ROBOT!",
                event: DIALOGUE_EVENTS.TURN_START
            },
            {
                type: DIALOGUE_TYPE.SPEECH,
                text: "Take this, electro-nightmare!",
                event: DIALOGUE_EVENTS.ON_ATTACK
            }
        ],
        abilities: [
            new Punch()
        ]
    }
};
