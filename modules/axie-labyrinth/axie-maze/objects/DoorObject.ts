import { PIXELS_PER_UNIT } from "../AxieMazeGame";

export class DoorObject extends PIXI.Container {
  model?: PIXI.Graphics;
 
  mapPos: PIXI.Point;
  colMapPos: PIXI.Point;

  unitId: number;
  level: number;

  constructor() {
    super();

    this.mapPos = new PIXI.Point();
    this.colMapPos = new PIXI.Point();
    this.unitId = -1;
    this.level = 0;
  }

  setup(level: number, colMapX:number, colMapY: number) {
    this.level = level;
    this.colMapPos = new PIXI.Point(colMapX, colMapY);

    const isWallX = colMapX % 2 == 1;
    if(this.model == null){
      const model = new PIXI.Graphics();
      this.model = model;
      this.addChild(model);
    }
    this.model.clear();
    this.model.lineStyle(2, 0xfeeb77, 1);
    if(level == 2){
      this.model.beginFill(0xfff1a9);
    } else if(level == 1){
      this.model.beginFill(0xe3e7e5);
    } else{
      this.model.beginFill(0x8a3324);
    }
    
    if(isWallX){
      this.model.drawRect(0, -PIXELS_PER_UNIT * 0.1, PIXELS_PER_UNIT, PIXELS_PER_UNIT * 0.2);
    } else{
      this.model.drawRect(-PIXELS_PER_UNIT * 0.1, 0, PIXELS_PER_UNIT * 0.2, PIXELS_PER_UNIT);
    }
    
    this.model.endFill();
  }

  setMapPos(mapX: number, mapY: number) {
    this.mapPos = new PIXI.Point(mapX, mapY);
    this.x = (/*0.5 + */mapX - 6) * PIXELS_PER_UNIT;
    this.y =  (mapY - 6/* + 0.6*/) * PIXELS_PER_UNIT;
  }
}
