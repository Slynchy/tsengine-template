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
import { Character, DIRECTION, IPlayerState, PLAYER_STATE } from "../Globals/PlayerState";
import { BattleLogic, IBattleState, ITileData } from "../Logic/BattleLogic";
import * as pixi from "pixi.js";
import { PIXIConfig } from "../../config/PIXIConfig";
import { GlowFilter, GodrayFilter } from "pixi-filters";
import { Ability } from "../Logic/Abilities/Ability";
import { Graphics } from "../Components/Graphics";

interface IBattleElementTree {
    grid?: pixi.Graphics;
    playerTile?: pixi.Graphics;
    enemy: {
        hpBar?: pixi.Graphics;
        sprite?: Sprite;
    };
    player?: Sprite;
    ui: {
        ultimate: {
            // bar?: pixi.Graphics;
            percent?: pixi.Text;
        }
        hpBar?: pixi.Graphics;
        mpBar?: pixi.Graphics;
        pPortrait?: Sprite;
        dialogueBox?: Sprite;
        dialogueText?: pixi.Text;
        textbox: {
            textboxBg?: Sprite;
            textboxTitle?: pixi.Text;
            textboxDesc?: pixi.Text;
            textboxDmg?: pixi.Text;
        };
        abilities: Sprite[];
    };
}

const gridW: number = 100;
const gridH: number = 55;

let textboxAnimBlock: boolean = false;

export class BattleScene extends State {

    private state: IBattleState;
    private player: Sprite;
    private enemy: pixi.Sprite;
    private playerTile: pixi.Graphics = new pixi.Graphics();
    private grid: pixi.Graphics;
    private blockInputReasons: string[] = [];

    private elementTree: IBattleElementTree = {
        enemy: {},
        ui: {
            textbox: {},
            abilities: [],
            ultimate: {}
        }
    };

    private abilityAtkTilesCache: pixi.Graphics[] = [];

    constructor(_engine: Engine) {
        super();
        this.state = BattleLogic.createBattleState({x: 7, y: 3});

        console.log(this.state);
    }

    public getGridPosFromSpritePos(sprite: Sprite): Vec2 {
        return {
            x: Math.floor((sprite.x) / gridW),
            y: Math.floor((sprite.y - (-sprite.height) * 1) / gridH ),
        } as Vec2;
    }

    public onAwake(_engine: Engine, _params?: unknown): void {
        const bg: GameObject = new GameObject();
        bg.addComponent(new Sprite(_engine.getTexture("bg")));

        let player: GameObject;
        const debugGrid: pixi.Graphics = this.grid = new pixi.Graphics();
        debugGrid.addChild(this.playerTile);
        debugGrid.lineStyle(1,0xFF0000,1,0.5);

        for(let x: number = 0; x < this.state.grid.size.x; x++) {
            for(let y: number = 0; y < this.state.grid.size.y; y++) {
                if(
                    this.state.grid[x][y].occupants.length !== 0
                    && this.state.grid[x][y].occupants[0] === PLAYER_STATE.playerCharacter
                ) {
                    player = new GameObject();
                    player.addComponent(this.player = new Sprite(_engine.getTexture("mc")));
                    this.player.getSpriteObj().scale.x = this.player.getSpriteObj().scale.y = 0.5;
                    this.player.x = 50;
                    this.player.y = (-this.player.height) * 0.8;
                    this.player.getSpriteObj().anchor.set(0.5, 0);
                    this.player.getSpriteObj().pivot.set(0.5, 0.5);
                }
                debugGrid.drawRect(x * gridW, y * gridH, gridW, gridH);
            }
        }

        debugGrid.position.x = (1280 / 2) - ((gridW * this.state.grid.size.x) / 2);
        debugGrid.position.y = (720 / 1.4) - ((gridH * this.state.grid.size.y) / 2);

        this.playerTile.lineStyle(3, 0x00FF00, 1, 0.5);
        const pPos: Vec2 = this.getGridPosFromSpritePos(this.player);
        this.playerTile.drawRect(pPos.x, pPos.y, gridW, gridH);

        const enemy: GameObject = new GameObject();
        let enemySpriteObj: pixi.Sprite;
        enemy.addComponent(new Sprite(_engine.getTexture("robo")));
        enemySpriteObj = enemy.getComponent(Sprite).getSpriteObj();
        enemySpriteObj.scale.set(0.5, 0.5);
        enemySpriteObj.anchor.set(0.5, 0);
        enemySpriteObj.pivot.set(0.5, 0.5);
        enemySpriteObj.x = 5 * 100 + 50;
        enemySpriteObj.y = (-(enemySpriteObj.height * 0.7)) + (gridH * 1);
        this.enemy = enemySpriteObj;

        const enemyHpBar: pixi.Graphics = new pixi.Graphics();
        enemyHpBar.beginFill(0xFF0000);
        enemyHpBar.drawRect(0, 0, 200, 15);
        enemyHpBar.endFill();
        enemyHpBar.filters = [
            new GlowFilter({
                color: 0xFF7777,
                // knockout: true,
            })
        ];
        enemyHpBar.x -= 100;
        enemySpriteObj.addChild(enemyHpBar);

        this.scene.addObject(bg);
        this.scene.addObject(debugGrid);
        debugGrid.addChild(enemySpriteObj);
        debugGrid.addChild(this.player.getSpriteObj());

        this.elementTree.enemy.sprite = enemy.getComponent(Sprite);
        this.elementTree.player = player.getComponent(Sprite);
        this.elementTree.enemy.hpBar = enemyHpBar;
        this.elementTree.grid = debugGrid;

        this.createUI(_engine);
    }

    public onDestroy(engine: Engine): void {
        this.scene.removeAllObjects();
    }

    public createUI(engine: Engine): void {
        const uiSprite: GameObject = new GameObject();
        uiSprite.addComponent(new Sprite(engine.getTexture("ui")));
        engine.getUIManager().addObject(uiSprite);

        const dialogueBoxGO: GameObject = new GameObject();
        const dialogueBox: Sprite = new Sprite(engine.getTexture("dialoguebox"));
        dialogueBox.getSpriteObj().anchor.set(0.5, 0.5);
        dialogueBoxGO.addComponent(dialogueBox);
        dialogueBox.x = this.player.x + 285;
        dialogueBox.y = this.player.y + 385;
        dialogueBox.getSpriteObj().visible = false;
        engine.getUIManager().addObject(dialogueBoxGO);

        // let tick: boolean = false;
        // setInterval(() => {
        //     if(tick) {
        //         dialogueBox.y += 5;
        //     } else {
        //         dialogueBox.y -= 5;
        //     }
        //     tick = !tick;
        //     // @ts-ignore
        //     window._FORCE_UI_UPDATE();
        // }, 1000);

        const dialogueText: pixi.Text = new pixi.Text(`"test"`, {
            fontFamily: "Comic Sans MS, Comic Sans, cursive",
            fill: "black",
            fontWeight: 800,
            breakWords: true,
            wordWrap: true,
            wordWrapWidth: dialogueBox.width * 0.9,
            lineHeight: 24,
            fontStyle: "italic",
            letterSpacing: -1,
            align: "center",
            padding: 3,
            fontSize: "22px"
        });
        dialogueText.anchor.set(0.5, 0.5);
        dialogueText.x = 0;
        dialogueText.y = -20;
        dialogueBox.getSpriteObj().addChild(dialogueText);

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
            letterSpacing: -1,
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
            letterSpacing: -2,
            align: "left",
            padding: 3,
            fontSize: "22px"
        });
        abilityDesc.x = 33;
        abilityDesc.y = 53;
        textboxSprite.getSpriteObj().addChild(abilityDesc);

        const abilityDmg: pixi.Text = new pixi.Text("-Mort, 2020", {
            fontFamily: "Comic Sans MS, Comic Sans, cursive",
            fill: "black",
            fontWeight: 400,
            fontStyle: "italic",
            align: "left",
            padding: 3,
            fontSize: "22px"
        });
        abilityDmg.x = 30;
        abilityDmg.y = 84;
        textboxSprite.getSpriteObj().addChild(abilityDmg);

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
                    const goingUp: boolean = (textboxSprite.y !== PIXIConfig.height - textboxSprite.height);
                    if(goingUp) {
                        setup();
                    } else {
                        cleanup.call(this);
                    }
                    textboxAnimBlock = true;

                    setTextboxVisiblity(goingUp);

                    if(goingUp) {
                        const atkRange: {[key: number]: {[key: number]: boolean}} = ability.getAttackRange();
                        const xKeys: string[] = Object.keys(atkRange).filter((e: string) => atkRange.hasOwnProperty(e));
                        const playerPos: Vec2 = this.getGridPosFromSpritePos(this.player);
                        // tslint:disable-next-line:prefer-for-of
                        for(let x: number = 0; x < xKeys.length; x++) {
                            const xKey: number = Number(xKeys[x]) as unknown as number;
                            const yKeys: string[] =
                                Object.keys(atkRange[xKey])
                                    .filter((e: string) => atkRange[xKey]
                                        .hasOwnProperty(e));
                            // tslint:disable-next-line:prefer-for-of
                            for(let y: number = 0; y < yKeys.length; y++) {
                                const yKey: number = Number(yKeys[y]) as unknown as number;
                                const targetTileObj: GameObject = new GameObject();
                                targetTileObj.addComponent(new Graphics());
                                const targetTile: pixi.Graphics = targetTileObj.getComponent(Graphics).getGraphicsObj();
                                targetTile.lineStyle(5, 0xFF6900,1,0.5);
                                targetTile.drawRect(0, 0, gridW, gridH);
                                this.grid.addChild(targetTile);
                                targetTile.filters = [
                                    new GlowFilter({
                                        color: 0xFF6900
                                    })
                                ];
                                targetTile.x = gridW * (playerPos.x + xKey);
                                targetTile.y = gridH * (playerPos.y + yKey);
                                this.abilityAtkTilesCache.push(targetTile);

                                let uuid: string;
                                uuid = engine.getInputManager().registerMouseOverObject(
                                    this.grid.x + targetTile.x, this.grid.y + targetTile.y,
                                    gridW, gridH,
                                    null,
                                    null,
                                    null,
                                    () => {
                                        cleanup.call(this);
                                        setTextboxVisiblity(false);
                                        engine.getInputManager().removeRegisteredMouseOverObject(uuid);
                                        this.makeAttack(ability);
                                    },
                                );
                            }
                        }
                    }

                    function cleanup(): void {
                        spriteComponent.getSpriteObj().filters = [];
                        this.abilityAtkTilesCache.forEach((e: pixi.Graphics) => {
                            e.parent.removeChild(e);
                            e.destroy();
                        });
                        this.abilityAtkTilesCache = [];
                    }

                    function getDest(_goingUp: boolean): Vec2 {
                        return (_goingUp ? {
                            x: textboxSprite.x,
                            y: PIXIConfig.height - textboxSprite.height
                        } : {
                            x: textboxSprite.x,
                            y: PIXIConfig.height
                        });
                    }

                    function setTextboxVisiblity(_visible: boolean): void {
                        HelperFunctions.lerpToPromise(
                            textboxSprite,
                            getDest(_visible),
                            0.05,
                            engine.getWASM("lerp").lerp
                        ).then((): void => {
                            textboxAnimBlock = false;
                        });
                    }

                    function setup(): void {
                        spriteComponent.addFilter(new GlowFilter({
                            color: 0xFF0000
                        }));
                        abilityName.text = ability.name;
                        abilityDesc.text = `"${ability.description}"`;
                        abilityDmg.text = ability.damageString;
                        textboxSprite.getSpriteObj().addChild(ability.createRangeImage());
                        ability.createRangeImage().x = textboxSprite.width - 125;
                        ability.createRangeImage().y = 25;
                    }
                }
            );
        });

        this.elementTree.ui.abilities = abilities;
        this.elementTree.ui.hpBar = hpBar;
        this.elementTree.ui.mpBar = mpBar;
        // this.elementTree.ui.ultimate.bar = ultimateBar;
        this.elementTree.ui.ultimate.percent = ultimatePercent;
        this.elementTree.ui.pPortrait = pPortraitSprite;
        this.elementTree.ui.textbox.textboxBg = textboxSprite;
        this.elementTree.ui.textbox.textboxDesc = abilityDesc;
        this.elementTree.ui.textbox.textboxDmg = abilityDmg;
        this.elementTree.ui.textbox.textboxTitle = abilityName;
        this.elementTree.ui.dialogueBox = dialogueBox;
        this.elementTree.ui.dialogueText = dialogueText;

    }

    private blockInputForReason(reason: string): void {
        this.blockInputReasons.push(reason);
    }

    private unblockInputForReason(reason: string): void {
        const index: number = this.blockInputReasons.findIndex((e: string) => e === reason);
        if(index === -1) {
            throw new Error("Failed to unblock input reason: " + reason);
        }
        this.blockInputReasons.splice(index, 1);
    }

    private updateUIFromState(battleState: IBattleState, playerState: IPlayerState): Promise<void> {
        return new Promise<void>(async (resolve: Function): Promise<void> => {
            this.elementTree.ui.hpBar.scale.x = playerState.playerCharacter.health / 100;
            this.elementTree.ui.mpBar.scale.x = playerState.playerCharacter.mp / 100;
            this.elementTree.enemy.hpBar.scale.x = battleState.enemyCharacter.health / 100;

            // @ts-ignore
            window._FORCE_UI_UPDATE();

            resolve();
        });
    }

    private makeAttack(ability: Ability): Promise<void> {
        return new Promise<void>(async (resolve: Function): Promise<void> => {
            // play attack animation here
            await ability.doAttackAnimation(this.elementTree.player, this.elementTree.enemy.sprite);

            // check if in range
            const isInRange: boolean = ability.isInRange(
                {
                    x: this.getGridPosFromSpritePos(this.elementTree.player).x,
                    y: this.getGridPosFromSpritePos(this.elementTree.player).y,
                },
                {
                    x: this.getGridPosFromSpritePos(this.elementTree.enemy.sprite).x,
                    y: this.getGridPosFromSpritePos(this.elementTree.enemy.sprite).y - 1,
                }
            );
            if(
                isInRange === false
            ) {
                resolve();
                return;
            }

            // do attack logic
            console.log(ability);
            PLAYER_STATE.playerCharacter.mp -= ability.mpCost;
            ability.applyAttack(PLAYER_STATE.playerCharacter, this.state.enemyCharacter);
            // @ts-ignore
            await HelperFunctions.shakeObject(this.scene.stage, 6, 60); // move?
            await this.updateUIFromState(this.state, PLAYER_STATE);
            await this.showDialogueBox(this.player, "Huh, Flesh doesn't seem to work on robots...");
            await HelperFunctions.delay(2000);
            await this.hideDialogueBox();
            resolve();
        });
    }

    public hideDialogueBox(): Promise<void> {
        return new Promise<void>(async (resolve: Function): Promise<void> => {
            this.elementTree.ui.dialogueBox.getSpriteObj().scale.set(1, 1);
            let progress: number = 1;
            await new Promise((resolve2: Function): void => {
                let intervalID: unknown;
                intervalID = setInterval(() => {
                    progress = Math.max(progress - 0.04, 0);
                    this.elementTree.ui.dialogueBox.getSpriteObj().scale.set(progress, 1);
                    // @ts-ignore
                    window._FORCE_UI_UPDATE();
                    if(progress === 0) {
                        // @ts-ignore
                        clearInterval(intervalID);
                        resolve2();
                    }
                }, 8);
            });
            this.elementTree.ui.dialogueBox.getSpriteObj().visible = false;
            // @ts-ignore
            window._FORCE_UI_UPDATE();
            resolve();
        });
    }

    public showDialogueBox(target: Sprite | Vec2, text: string): Promise<void> {
        return new Promise<void>(async (resolve: Function): Promise<void> => {
            this.elementTree.ui.dialogueText.text = `"${text}"`;
            this.elementTree.ui.dialogueBox.x = target.x + 285;
            this.elementTree.ui.dialogueBox.y = target.y + 385;
            this.elementTree.ui.dialogueBox.getSpriteObj().scale.set(0, 1);
            this.elementTree.ui.dialogueBox.getSpriteObj().visible = true;
            let progress: number = 0;
            await new Promise((resolve2: Function): void => {
                let intervalID: unknown;
                intervalID = setInterval(() => {
                    progress = Math.min(progress + 0.04, 1);
                    this.elementTree.ui.dialogueBox.getSpriteObj().scale.set(progress, 1);
                    // @ts-ignore
                    window._FORCE_UI_UPDATE();
                    if(progress === 1) {
                        // @ts-ignore
                        clearInterval(intervalID);
                        resolve2();
                    }
                }, 8);
            });
            // @ts-ignore
            window._FORCE_UI_UPDATE();
            resolve();
        });
    }

    public onStep(_engine: Engine): void {
        this.scene.onStep(_engine);

        const speed: number = 2;
        let changeDetected: boolean = false;
        if(_engine.getInputManager().isKeyDown(68)) {
            this.player.getSpriteObj().position.x += speed * _engine.deltaTime;
            if(this.player.getSpriteObj().position.x > gridW * this.state.grid.size.x) {
                this.player.getSpriteObj().position.x = Math.floor(gridW * this.state.grid.size.x) - 1;
            }
            PLAYER_STATE.playerCharacter.direction = DIRECTION.right;
            this.player.getSpriteObj().scale.x = Math.abs(this.player.getSpriteObj().scale.x);
            changeDetected = true;
        }
        if(_engine.getInputManager().isKeyDown(65)) {
            this.player.getSpriteObj().position.x -= speed * _engine.deltaTime;
            if(this.player.getSpriteObj().position.x < 0) this.player.getSpriteObj().position.x = 0;
            PLAYER_STATE.playerCharacter.direction = DIRECTION.left;
            if(this.player.getSpriteObj().scale.x > 0) {
                this.player.getSpriteObj().scale.x = this.player.getSpriteObj().scale.x * -1;
            }
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
