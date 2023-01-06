import { Figure } from '../../axie-figure/Figure';
import { FIXED_TIME_STEP, PIXELS_PER_UNIT } from '../AxieMazeGame';

export class AxieObject extends PIXI.Container {
  mapPos: PIXI.Point;
  vel: PIXI.Point;

  unitId: number;

  currentSpine?: Figure;
  currentAnimation: string;

  constructor() {
    super();
    this.currentAnimation = 'action/idle/normal';

    this.unitId = -1;
   
    this.mapPos = new PIXI.Point();
    this.vel = new PIXI.Point();
  }

  setMapPos(mapX: number, mapY: number) {
    this.mapPos = new PIXI.Point(mapX, mapY);
    this.x = (0.5 + mapX - 6) * PIXELS_PER_UNIT;
    this.y =  (mapY - 6 + 0.8) * PIXELS_PER_UNIT;
  }

  fixedUpdate() {
    this.currentSpine?.update(FIXED_TIME_STEP);
  }
}
