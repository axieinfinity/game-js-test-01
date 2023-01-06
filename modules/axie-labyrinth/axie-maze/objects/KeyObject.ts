import { PIXELS_PER_UNIT } from "../AxieMazeGame";

export class KeyObject extends PIXI.Container {
  models: Array<PIXI.Sprite>;
  mapPos: PIXI.Point;

  unitId: number;
  level: number;

  constructor() {
    super();

    this.models = []
    this.mapPos = new PIXI.Point();
    this.unitId = -1;
    this.level = 0;
  }

  setup(level: number) {
    this.level = level;
    for(let i=0;i<this.models.length;i++){
      this.models[i].visible = (level == i);
    }
  }

  setMapPos(mapX: number, mapY: number) {
    this.mapPos = new PIXI.Point(mapX, mapY);
    this.x = (0.5 + mapX - 6) * PIXELS_PER_UNIT;
    this.y =  (mapY - 6 + 0.5) * PIXELS_PER_UNIT;
  }
}
