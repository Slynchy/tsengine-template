import { Character, IPlayerState, PLAYER_STATE } from "../Globals/PlayerState";
import { GameObject, Vec2 } from "../../../lib/tsengine";

export interface ITileData {
    position: Vec2;
    occupants: Character[];
}

export interface IBattleState {
    grid: {
        size: Vec2
        [key: number]: {
            [key: number]: ITileData // grid data
        }
    };
}

export class BattleLogic {
    constructor() { /* SHOULD NOT BE INSTANTIATED */}

    public static createBattleState(size: Vec2): IBattleState {
        const state: IBattleState = {} as IBattleState;

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
