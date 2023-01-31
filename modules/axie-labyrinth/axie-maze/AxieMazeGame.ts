import {
  AxieMixer,
  getAxieColorPartShift,
  getVariantAttachmentPath,
} from '@axieinfinity/mixer';
import * as PIXI from "pixi.js";
import { GameObjectPool } from "./GameObjectPool";
import { UILayer } from "./UILayer";
import { axieGenesPool } from './GenesPool';
import { AxieObject } from './objects/AxieObject';
import { Key, keyboard } from "../utils/helper";
import { FLOOR_MAPS } from './MapPool';
import * as MS from './MazeState';
import { DoorObject } from './objects/DoorObject';
import { KeyObject } from './objects/KeyObject';

export const FIXED_TIME_STEP = 0.02;
export const PIXELS_PER_UNIT = 60;

class KeyMap {
  [name: string]: Key
};

export class AxieMazeGame extends PIXI.Application {
  offsetWidth: number;
  offsetHeight: number;
 
  canvasScale:number;
  root: PIXI.Container;

  keyInputs: KeyMap;

  myAxies: Array<any> | undefined;
  axieGenes: Map<string, string>;
  spineDesc: Array<any>;
  isLoaded: boolean;
  isPlaying: boolean;

  mazeState: MS.MazeState;

  pools: GameObjectPool | null;
  doors: Array<DoorObject>;
  keys: Array<KeyObject>;

  axie: AxieObject | null;
  maze: PIXI.Graphics;

  turnDelay: number;
  autoMoveDelay: number;

  frameLoading: PIXI.Container | null;
  uiLayer: UILayer;
  debugText: PIXI.Text;

  constructor(options: any) {
    super(options);
    this.offsetWidth = options.width;// / options.resolution;
    this.offsetHeight = options.height;// / options.resolution;

    this.axieGenes = new Map<string, string>();
    this.spineDesc = new Array();
    this.isLoaded = false;
    this.isPlaying = false;
    this.axie = null;

    this.doors = [];
    this.keys = [];
    this.mazeState = new MS.MazeState();

    this.turnDelay = 0.1;
    this.autoMoveDelay = 5;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x70C8F7, 1);
    graphics.drawRect(0, 0, this.offsetWidth, this.offsetHeight);
    graphics.endFill();
    this.stage.addChild(graphics);

    const designWidth = 768;
    const designHeight = 768;
  
    const scaleX = this.offsetWidth / designWidth;
    const scaleY = this.offsetHeight / designHeight;
    const minScale = Math.min(scaleX, scaleY);
    this.canvasScale = minScale;
    console.log(`resolution:${options.resolution} offsetWidth:${this.offsetWidth} offsetHeight:${this.offsetHeight}`);

    const root = new PIXI.Container();
    root.scale = new PIXI.Point(minScale, minScale);
    root.pivot.set(0.5);
    root.x = this.offsetWidth/2;
    root.y = this.offsetHeight/2 + PIXELS_PER_UNIT / 2;

    this.stage.addChild(root);
    this.root = root;

    const model = new PIXI.Graphics();
    model.lineStyle(2, 0xFFFFFF, 1);
    model.beginFill(0xAA4F08, 0.5);
    model.drawRect(-64*6, -64*6, 64*12, 64*12);
    model.endFill();
    this.root.addChild(model);
    this.maze = model;

    this.uiLayer = new UILayer();
    this.stage.addChild(this.uiLayer);

    const frameLoading = PIXI.Sprite.fromImage('/sprites/frame-loading.png');
    frameLoading.anchor.set(0.5);
    frameLoading.scale.set(minScale);
    frameLoading.x = this.offsetWidth / 2;
    frameLoading.y = this.offsetHeight / 2;
    this.stage.addChild(frameLoading);
    this.frameLoading = frameLoading;

    this.debugText = new PIXI.Text('', {
      fontFamily: 'Snippet',
      fontSize: 18,
      fill: 'white',
      align: 'left',
    });
    this.debugText.position.set(50, 20);
    this.stage.addChild(this.debugText);

    this.stage.interactive = true;

    this.pools = null;

    this.keyInputs = {
      left: keyboard("ArrowLeft"),
      right: keyboard("ArrowRight"),
      up: keyboard("ArrowUp"),
      down: keyboard("ArrowDown"),
    }
    this.registerKeyBoardController();
  }

  registerKeyBoardController() {
    for (let key in this.keyInputs) {
      window.addEventListener("keydown", this.keyInputs[key].downHandler, false);
      window.addEventListener("keyup", this.keyInputs[key].upHandler, false);
    }

    this.keyInputs.left.release = () => { this.autoMoveDelay = 5; this.moveAxie(-1, 0); }
    this.keyInputs.right.release = () => { this.autoMoveDelay = 5; this.moveAxie(1, 0); }
    this.keyInputs.up.release = () => { this.autoMoveDelay = 5; this.moveAxie(0, -1); }
    this.keyInputs.down.release = () => { this.autoMoveDelay = 5; this.moveAxie(0, 1); }

    const onClickDown = () => {

    };

    const onClickUp = () => {
      if(!this.isPlaying){
        this.resetGame();
      }
    };
    this.renderer.plugins.interaction.on('pointerdown', onClickDown);
    this.renderer.plugins.interaction.on('pointerup', onClickUp);
  }

  initGame(){
    if (this.isLoaded) return;
    this.initGameInternal();
  }

  private initGameInternal() {
    if (this.isLoaded) return;

    this.axieGenes = new Map();

    axieGenesPool.sort(() => (Math.random() > .5) ? 1 : -1);

    let remain = 10;
    if(this.myAxies != undefined){
      this.myAxies.sort(() => (Math.random() > .5) ? 1 : -1);
      for(let i=0;remain>0 && i<this.myAxies.length;i++){
        const p = this.myAxies[i];
        this.axieGenes.set(p.id, p.genes);
        remain -= 1;
      }
    }

    for(let i=0;remain > 0 && i<axieGenesPool.length;i++){
      const p = axieGenesPool[i];
      this.axieGenes.set(p.id, p.genes);
      remain--;
    }

    // this.stage.interactive = true;
    this.renderer.view.style.touchAction = 'auto';
    this.renderer.plugins.interaction.autoPreventDefault = false;
    this.view.style.width = `${this.offsetWidth}px`;
    this.view.style.height = `${this.offsetHeight}px`;

    const allTexture: string[] = [];
    this.axieGenes.forEach((genes, id) => {
      const mixer = new AxieMixer(genes);

      const skinAttachments = mixer.spine.skins[0].attachments;

      const resourcePath = 'https://axiecdn.axieinfinity.com/mixer-stuffs/v2/';
      const partColorShift = getAxieColorPartShift(mixer.variant);
      const atlasKeyMap = new Map();
      for (const slotName in skinAttachments) {
        const skinSlotAttachments = skinAttachments[slotName];
        for (const attachmentName in skinSlotAttachments) {
          const path = skinSlotAttachments[attachmentName].path;

          const imagePath =
            resourcePath +
            getVariantAttachmentPath(
              slotName,
              path,
              mixer.variant,
              partColorShift,
            );
          const texKey = `${mixer.variant}.${path}`;
          atlasKeyMap.set(texKey, path);
          if (allTexture.includes(texKey)) continue;
          allTexture.push(texKey);

          this.loader.add(texKey, imagePath);
        }
      }

      this?.spineDesc.push({
        id,
        mixer,
        atlasKeyMap,
      });
    });

    for(const {name} of MS.KEYS){
      this.loader.add(name, `/sprites/${name}.png`);
    }

    this.loader.load();
    this.loader.once('complete', () => {
      console.log('Begin load font');
      var that = this;
      //@ts-ignore
      window.WebFontConfig = {
        google: {
            families: ['Work Sans', 'Changa One'],
        },
    
        active() {
          that.completedLoad();
        },
      };

      const wf = document.createElement('script');
      wf.src = `${document.location.protocol === 'https:' ? 'https' : 'http'
      }://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
      wf.type = 'text/javascript';
      //@ts-ignore
      wf.async = 'true';
      const s = document.getElementsByTagName('script')[0];
      //@ts-ignore
      s.parentNode.insertBefore(wf, s);
    });
  }

  completedLoad() {
    if(this.frameLoading != null){
      this.stage.removeChild(this.frameLoading);
      this.frameLoading = null;
    }

    this.pools = new GameObjectPool(this.spineDesc, this.root, this.loader);
    this.uiLayer.init(this.offsetWidth, this.offsetHeight, this.canvasScale, this.loader);

    this.isLoaded = true;
    this.startGame();
  }

  resetGame() {
    // this.uiLayer?.setBestScoreText(this.bestMapWeight);
    // this.uiLayer?.setScoreText(0);
    // this.uiLayer?.setWaitToStart(true);
    this.uiLayer?.setResultFrame(false);
    
    this.mazeState.loadMaps(FLOOR_MAPS);

    this.uiLayer?.setInventoryStates(this.mazeState.axie.consumableItems);
   
    if(this.axie == null){
      //@ts-ignore
      this.axie = this.pools?.newInstanseAxie();
    }
    if(this.axie != null){
      this.axie.visible = true;
      this.axie.setMapPos(this.mazeState.axie.mapX, this.mazeState.axie.mapY);
    }

    this.enterFloor(this.mazeState.currentFloorIdx);
    this.isPlaying = true;
  }

  enterFloor(idx: number){
    this.maze.clear();
    this.maze.beginFill(0xAA4F08, 0.5);

    console.log(`enterFloor: ${idx}`);
    this.mazeState.currentFloorIdx = idx;
    const floorMap = this.mazeState.floors[this.mazeState.currentFloorIdx];

    for (let i = 0; i < this.doors.length; i++) {
      this.doors[i].visible = false;
    }
    this.doors = [];

    for (let i = 0; i < this.keys.length; i++) {
      this.keys[i].visible = false;
    }
    this.keys = [];

    for (let i = 0; i < MS.MAP_SIZE * 2 + 1; i++) {
      for (let j = 0; j < MS.MAP_SIZE * 2 + 1; j++) {
        const x = Math.trunc(j / 2);
        const y = Math.trunc(i / 2);
        const val = floorMap.map[i][j]
        if(i % 2 == 1 && j % 2 == 0){
          if(val == MS.MAP_CODE_WALL){
            this.maze.drawRect(PIXELS_PER_UNIT * (x - 6), PIXELS_PER_UNIT * (y - 6), PIXELS_PER_UNIT * 0.05, PIXELS_PER_UNIT);
          }
        } else if(i % 2 == 0 && j % 2 == 1){
          if(val == MS.MAP_CODE_WALL){
            this.maze.drawRect(PIXELS_PER_UNIT * (x - 6), PIXELS_PER_UNIT * (y - 6), PIXELS_PER_UNIT, PIXELS_PER_UNIT * 0.05);
          }
        } else if(i % 2 == 1 && j % 2 == 1){
          if(val == MS.MAP_CODE_END){
            this.maze.drawRect(PIXELS_PER_UNIT * (x - 6 + 0.2), PIXELS_PER_UNIT * (y - 6 + 0.2), PIXELS_PER_UNIT * 0.6, PIXELS_PER_UNIT * 0.6);
          }
        }
      } 
    }

    for(const itemState of floorMap.itemStates){
      if(!itemState.available) continue;
      if(itemState.code >= MS.MAP_CODE_KEY_A && itemState.code <= MS.MAP_CODE_KEY_B){
        const key = this.pools?.newInstanseKey();
        if(key != null){
          key.setMapPos(itemState.mapX, itemState.mapY);
          key.setup(itemState.code - MS.MAP_CODE_KEY_A);
          this.keys.push(key);
        }
      }
    }

    for(const doorState of floorMap.doorStates){
      if(!doorState.locked) continue;
      const door = this.pools?.newInstanseDoor();
        if(door != null){
          door.setMapPos(Math.trunc(doorState.colMapX / 2), Math.trunc(doorState.colMapY / 2));
          door.setup(doorState.level, doorState.colMapX, doorState.colMapY);
          this.doors.push(door);
        }
    }

    this.maze.endFill();
  }

  moveAxie(dx: number, dy: number){
    if(!this.isPlaying || this.axie == null) return;
    const nx = this.mazeState.axie.mapX + dx;
    const ny = this.mazeState.axie.mapY + dy;
    let colMapX, colMapY;
    if(dx != 0){
      colMapX = (this.mazeState.axie.mapX + (dx == 1 ? 1 : 0)) * 2;
      colMapY = this.mazeState.axie.mapY * 2 + 1;
    } else {
      colMapX = this.mazeState.axie.mapX * 2 + 1;
      colMapY = (this.mazeState.axie.mapY + (dy == 1 ? 1 : 0)) * 2;
    }
    const logs = this.mazeState.onMove(dx, dy);
    const action = logs['action'];
    
    switch(action){
      case 'move':
        this.axie.setMapPos(this.mazeState.axie.mapX, this.mazeState.axie.mapY);
        break;
      case 'enterFloor':
        if(this.mazeState.isWon){
          this.gameOver(true);
        } else{
          this.enterFloor(this.mazeState.currentFloorIdx);
        }
        this.axie.setMapPos(this.mazeState.axie.mapX, this.mazeState.axie.mapY);
        break;
      case 'gainKey':
        this.syncKey(nx, ny);
        this.axie.setMapPos(this.mazeState.axie.mapX, this.mazeState.axie.mapY);
        break;
      case 'unlockDoor':
        this.syncDoor(colMapX, colMapY);
        break;
        
      default:
        break;
    }
  }

  syncKey(mapX: number, mapY: number){
    const floorMap = this.mazeState.floors[this.mazeState.currentFloorIdx];
    const key = this.keys.find(x => x.mapPos.x == mapX && x.mapPos.y == mapY);
    const itemState = floorMap.itemStates.find(x => x.mapX == mapX && x.mapY == mapY);
    if(key == null || itemState == null) return;
    if(!itemState.available){
      key.visible = false;
    }
    this.uiLayer?.setInventoryStates(this.mazeState.axie.consumableItems);
  }

  syncDoor(colMapX: number, colMapY: number){
    const door = this.doors.find(x => x.colMapPos.x == colMapX && x.colMapPos.y == colMapY);
    if(door == null) return;

    const floorMap = this.mazeState.floors[this.mazeState.currentFloorIdx];
    if(floorMap.map[colMapY][colMapX] == MS.MAP_CODE_CLEAR){
      door.visible = false;
    }
    this.uiLayer?.setInventoryStates(this.mazeState.axie.consumableItems);
  }

  gameOver(isWon: boolean){
    this.isPlaying = false;
    this.uiLayer?.setResultFrame(true);
    this.uiLayer?.setResultText(isWon);
  }

  startGame() {
    this.resetGame();
    const play = () => {
      if(this.axie == null || !this.isPlaying) return;

      this.axie.fixedUpdate();
      this.autoMoveDelay -= PIXI.ticker.shared.elapsedMS * 0.001;
      if (this.autoMoveDelay <= 0){
        this.turnDelay -= PIXI.ticker.shared.elapsedMS * 0.001;
        if (this.turnDelay <= 0){
          this.turnDelay = 0.25;
          this.onSimulateTurn();
        }
      }      
    };

    this?.ticker?.add((_) => play());
    this.start();
  }

  //***************YOUR CODE HERE**************************/
  onSimulateTurn(){
    //Do you check and give the action to reach the goal
    const floorMap = this.mazeState.floors[this.mazeState.currentFloorIdx];

    let targetPos = new PIXI.Point();
    for (let y = 0; y < MS.MAP_SIZE; y++) {
        for (let x = 0; x < MS.MAP_SIZE; x++) {
            const roomVal = this.mazeState.getRoomValue(x, y);
            if (roomVal == MS.MAP_CODE_END) {
                targetPos = new PIXI.Point(x, y); 
            }
        }
    }
    const ranVal = Math.random() * 4;
    if (ranVal == 0 && this.mazeState.testMove(-1, 0) == MS.MOVE_RESULT_VALID) {
        this.moveAxie(-1, 0);
    }
    else if (ranVal == 1 && this.mazeState.testMove(1, 0) == MS.MOVE_RESULT_VALID) {
        this.moveAxie(1, 0);
    }
    else if (ranVal == 2 && this.mazeState.testMove(0, -1) == MS.MOVE_RESULT_VALID) {
        this.moveAxie(0, -1);
    }
    else if (ranVal == 3 && this.mazeState.testMove(0, 1) == MS.MOVE_RESULT_VALID) {
        this.moveAxie(0, 1);
    }
  }
}
