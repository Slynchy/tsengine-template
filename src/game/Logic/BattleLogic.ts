import {
    Character,
    DIALOGUE_EVENTS,
    DIALOGUE_TYPE,
    DIRECTION,
    IPlayerState,
    PLAYER_STATE
} from "../Globals/PlayerState";
import { GameObject, Vec2 } from "../../../lib/tsengine";
import { Punch } from "./Abilities/Punch";

export interface ITileData {
    position: Vec2;
    occupants: Character[];
}

export interface IBattleState {
    turnOrder: Character[];
    enemyCharacter: Character;
    grid: {
        size: Vec2
        [key: number]: {
            [key: number]: ITileData // grid data
        }
    };
}

export class BattleLogic {
    constructor() { /* SHOULD NOT BE INSTANTIATED */}

    public static moveOccupantToNewTile(
        state: IBattleState,
        occupantRef: unknown,
        src: Vec2,
        dest: Vec2
    ): IBattleState {
        // tslint:disable-next-line:triple-equals
        const occupantIndex: number = state.grid[src.x][src.y].occupants.findIndex((e: unknown) => e == occupantRef);
        if(occupantIndex === -1) {
            console.error(occupantRef);
            throw new Error("Failed to find!");
        }

        const occupant: unknown[] = state.grid[src.x][src.y].occupants.splice(occupantIndex, 1);
        // @ts-ignore
        state.grid[dest.x][dest.y].occupants.push(occupant[0]);

        return state;
    }

    public static createBattleState(size: Vec2): IBattleState {
        const state: IBattleState = {
            enemyCharacter: {
                health: 100,
                mp: 100,
                name: "BuddyBot 3000",
                direction: DIRECTION.left,
                ultimatePercent: 0, // not gonna be used?
                availableDialogueLines: [
                    {
                        type: DIALOGUE_TYPE.SPEECH,
                        text: "~I SIMPLY WANT TO LOVE~",
                        event: DIALOGUE_EVENTS.TURN_START
                    },
                    {
                        type: DIALOGUE_TYPE.SPEECH,
                        text: "~YOU HAVE FORCED ME TO DO THIS~",
                        event: DIALOGUE_EVENTS.ON_ATTACK
                    }
                ],
                abilities: [
                    new Punch() // ROBO PUNCH!
                ]
            }
        } as IBattleState;

        state.grid = {
            size: size,
        };

        for(let x: number = 0; x < size.x; x++) {
            state.grid[x] = {};
            for(let y: number = 0; y < size.y; y++) {
                state.grid[x][y] = {
                    occupants: [],
                    position: {x,y}
                };
            }
        }

        state.grid[0][0].occupants.push(
            PLAYER_STATE.playerCharacter
        );

        return state;
    }
}
