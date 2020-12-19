import {
    ContainerComponent,
    Engine,
    GameObject,
    HelperFunctions,
    InputManager,
    Sprite,
    State,
    Vec2
} from "../../../lib/tsengine";
import { Character, PLAYER_STATE } from "../Globals/PlayerState";
import { BattleLogic, IBattleState } from "../Logic/BattleLogic";
import * as pixi from "pixi.js";
import { PIXIConfig } from "../../config/PIXIConfig";
import { GlowFilter } from "pixi-filters";
import { Ability } from "../Logic/Abilities/Ability";

const gridW: number = 100;
const gridH: number = 55;

let textboxAnimBlock: boolean = false;

export class BattleScene extends State {

    private state: IBattleState;
    private player: Sprite;
    private enemy: pixi.Sprite;
    private playerTile: pixi.Graphics = new pixi.Graphics();
    private turnOrder: Character[] = [];

    constructor(_engine: Engine) {
        super();
        this.state = BattleLogic.createBattleState({x: 7, y: 3});

        console.log(this.state);
    }

    public getGridPosFromSpritePos(sprite: Sprite): Vec2 {
        return {
            x: Math.floor((sprite.x + 50) / gridW),
            y: Math.floor((sprite.y - (-sprite.height) * 1) / gridH ),
        } as Vec2;
    }

    public onAwake(_engine: Engine, _params?: unknown): void {
        const bg: GameObject = new GameObject();
        bg.addComponent(new Sprite(_engine.getTexture("bg")));

        let player: GameObject;
        const debugGrid: pixi.Graphics = new pixi.Graphics();
        debugGrid.addChild(this.playerTile);
        debugGrid.lineStyle(1,0xFF0000,1,0);
        for(let x: number = 0; x < this.state.grid.size.x; x++) {
            for(let y: number = 0; y < this.state.grid.size.y; y++) {
                if(
                    this.state.grid[x][y].occupants.length !== 0
                    && this.state.grid[x][y].occupants[0] === PLAYER_STATE.playerCharacter
                ) {
                    player = new GameObject();
                    player.addComponent(this.player = new Sprite(_engine.getTexture("mc")));
                    this.player.getSpriteObj().scale.x = this.player.getSpriteObj().scale.y = 0.5;
                    this.player.x = 0;
                    this.player.y = (-this.player.height) * 0.8;
                }
                debugGrid.drawRect(x * gridW, y * gridH, gridW, gridH);
            }
        }

        debugGrid.position.x = (1280 / 2) - ((gridW * this.state.grid.size.x) / 2);
        debugGrid.position.y = (720 / 1.4) - ((gridH * this.state.grid.size.y) / 2);

        this.playerTile.lineStyle(3, 0x00FF00, 1, 0);
        const pPos: Vec2 = this.getGridPosFromSpritePos(this.player);
        this.playerTile.drawRect(pPos.x, pPos.y, gridW, gridH);

        this.turnOrder.push(PLAYER_STATE.playerCharacter);

        const enemy: GameObject = new GameObject();
        let enemySpriteObj: pixi.Sprite;
        enemy.addComponent(new Sprite(_engine.getTexture("robo")));
        enemySpriteObj = enemy.getComponent(Sprite).getSpriteObj();
        enemySpriteObj.scale.set(0.5, 0.5);
        enemySpriteObj.x = 5 * 100 - 10;
        enemySpriteObj.y = (-(enemySpriteObj.height * 0.7)) + (gridH * 1);
        this.enemy = enemySpriteObj;

        this.scene.addObject(bg);
        this.scene.addObject(debugGrid);
        debugGrid.addChild(enemySpriteObj);
        debugGrid.addChild(this.player.getSpriteObj());

        this.createUI(_engine);
    }

    public onDestroy(engine: Engine): void {
        this.scene.removeAllObjects();
    }

    public createUI(engine: Engine): void {
        const uiSprite: GameObject = new GameObject();
        uiSprite.addComponent(new Sprite(engine.getTexture("ui")));
        engine.getUIManager().addObject(uiSprite);

        const ultimatePercent: pixi.Text =
            new pixi.Text(`${Math.floor(PLAYER_STATE.playerCharacter.ultimatePercent)}%`, {
                fontFamily: "Comic Sans MS, Comic Sans, cursive",
                fill: "white",
                fontWeight: 300,
                align: "right",
                fontSize: "25px"
            });
        ultimatePercent.x = PIXIConfig.width - 55;
        ultimatePercent.y = 140;
        engine.getUIManager().addObject(ultimatePercent);

        const hpBar: pixi.Graphics = new pixi.Graphics();
        hpBar.beginFill(0xFF0000);
        hpBar.drawRect(0, 0, 119, 7);
        hpBar.endFill();
        hpBar.position.set(160, 637);
        engine.getUIManager().addObject(hpBar);

        const mpBar: pixi.Graphics = new pixi.Graphics();
        mpBar.beginFill(0x00AAFF);
        mpBar.drawRect(0, 0, 119, 7);
        mpBar.endFill();
        mpBar.position.set(159, 680);
        engine.getUIManager().addObject(mpBar);

        const pPortrait: GameObject = new GameObject();
        const pPortraitSprite: Sprite = new Sprite(engine.getTexture("pcharacter"));
        pPortrait.addComponent(pPortraitSprite);
        pPortraitSprite.x = 20;
        pPortraitSprite.y = 600;
        engine.getUIManager().addObject(pPortrait);

        const textboxContainer: GameObject = new GameObject();
        const textboxSprite: Sprite = new Sprite(engine.getTexture("textbox"));
        textboxContainer.addComponent(textboxSprite);
        textboxSprite.x = (PIXIConfig.width / 2) - (textboxSprite.width / 2) - 20;
        textboxSprite.y = PIXIConfig.height; // - textboxSprite.height;
        engine.getUIManager().addObject(textboxContainer);

        const abilityName: pixi.Text = new pixi.Text("#friend-jam", {
            fontFamily: "Comic Sans MS, Comic Sans, cursive",
            fill: "black",
            fontWeight: 800,
            align: "left",
            fontSize: "28px"
        });
        abilityName.x = 36;
        abilityName.y = 15;
        textboxSprite.getSpriteObj().addChild(abilityName);

        const abilityDesc: pixi.Text = new pixi.Text("the best jam is made of friends", {
            fontFamily: "Comic Sans MS, Comic Sans, cursive",
            fill: "black",
            fontWeight: 800,
            fontStyle: "italic",
            align: "left",
            padding: 3,
            fontSize: "22px"
        });
        abilityDesc.x = 33;
        abilityDesc.y = 53;
        textboxSprite.getSpriteObj().addChild(abilityDesc);

        const abilities: Sprite[] = [];
        PLAYER_STATE.playerCharacter.abilities.forEach((ability: Ability, i: number) => {
            const currGO: GameObject = new GameObject();
            const spriteComponent: Sprite = new Sprite(engine.getTexture(ability.abilityIconKey));
            currGO.addComponent(spriteComponent);
            engine.getUIManager().addObject(currGO);
            spriteComponent.x = 952;
            spriteComponent.y = 607;
            spriteComponent.getSpriteObj().scale.set(0.85, 0.85);
            abilities.push(spriteComponent);

            engine.getInputManager().registerMouseOverObject(
                952, 607,
                spriteComponent.width, spriteComponent.height,
                null, null, null,
                async () => {
                    if(textboxAnimBlock) return;
                    abilityName.text = ability.name;
                    abilityDesc.text = `"${ability.description}"`;
                    if(textboxSprite.y !== PIXIConfig.height - textboxSprite.height) {
                        spriteComponent.addFilter(new GlowFilter({
                            color: 0xFF0000
                        }));
                    } else {
                        spriteComponent.getSpriteObj().filters = [];
                    }
                    textboxAnimBlock = true;

                    const destination: Vec2 = (textboxSprite.y !== PIXIConfig.height - textboxSprite.height) ? {
                        x: textboxSprite.x,
                        y: PIXIConfig.height - textboxSprite.height
                    } : {
                        x: textboxSprite.x,
                        y: PIXIConfig.height
                    };

                    HelperFunctions.lerpToPromise(
                        textboxSprite,
                        destination,
                        0.05,
                        engine.getWASM("lerp").lerp
                    ).then((): void => {
                        textboxAnimBlock = false;
                    });
                }
            );
        });
    }

    public onStep(_engine: Engine): void {
        const speed: number = 2;
        let changeDetected: boolean = false;
        if(_engine.getInputManager().isKeyDown(68)) {
            this.player.getSpriteObj().position.x += speed * _engine.deltaTime;
            changeDetected = true;
        }
        if(_engine.getInputManager().isKeyDown(65)) {
            this.player.getSpriteObj().position.x -= speed * _engine.deltaTime;
            changeDetected = true;
        }
        if(_engine.getInputManager().isKeyDown(87)) {
            this.player.getSpriteObj().position.y -= speed * _engine.deltaTime;
            changeDetected = true;
        }
        if(_engine.getInputManager().isKeyDown(83)) {
            this.player.getSpriteObj().position.y += speed * _engine.deltaTime;
            changeDetected = true;
        }

        if(changeDetected) {
            const pPos: Vec2 = this.getGridPosFromSpritePos(this.player);
            this.playerTile.x = pPos.x * gridW;
            this.playerTile.y = pPos.y * gridH;
        }

        // @ts-ignore
        // this.scene.stage.position.y += 1 * _engine.deltaTime;
    }
}
