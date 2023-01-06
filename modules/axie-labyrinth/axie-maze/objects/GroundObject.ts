
export class GroundObject extends PIXI.Container {
  model?: PIXI.Graphics;
 
  mapPos: PIXI.Point;
  mapSize: PIXI.Point;

  unitId: number;

  constructor() {
    super();

    this.mapPos = new PIXI.Point();
    this.mapSize = new PIXI.Point();

    this.unitId = -1;

  }

  setSize(sizeX: number, sizeY: number) {
    this.mapSize = new PIXI.Point(sizeX, sizeY);
  }

  setup() {
  }

}
