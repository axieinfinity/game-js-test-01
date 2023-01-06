import { Figure } from '../axie-figure/Figure';
import { KEYS } from './MazeState';
import { AxieObject } from './objects/AxieObject';
import { DoorObject } from './objects/DoorObject';
import { GroundObject } from './objects/GroundObject';
import { KeyObject } from './objects/KeyObject';

export class GameObjectPool {
  root: PIXI.Container;
  loader: PIXI.loaders.Loader;
  spineDesc: Array<any>;
  axiePools: Array<AxieObject>;
  groundPools: Array<GroundObject>;
  doorPools: Array<DoorObject>;
  keyPools: Array<KeyObject>;

  constructor(spineDesc: Array<any>, root: PIXI.Container, loader: PIXI.loaders.Loader) {
    this.spineDesc = spineDesc;
    this.root = root;
    this.loader = loader;
    this.axiePools = [];
    this.groundPools = [];
    this.doorPools = [];
    this.keyPools = [];
    this.initPools();
  }

  reset() {
    this.axiePools.forEach(x => x.visible = false);
    this.groundPools.forEach(x => x.visible = false);
  }

  initPools() {
    const maxAxie = 1;
    const maxGround = 20;
    const maxDoor = 20;
    const maxKey = 20;

    for(let i=0;i<maxGround;i++){
      const obj = this.createGround();
      obj.unitId = i;
      obj.visible = false;
      this.groundPools.push(obj);
    }

    for(let i=0;i<maxDoor;i++){
      const obj = this.createDoor();
      obj.unitId = i;
      obj.visible = false;
      this.doorPools.push(obj);
    }

    for(let i=0;i<maxKey;i++){
      const obj = this.createKey();
      obj.unitId = i;
      obj.visible = false;
      this.keyPools.push(obj);
    }

    for(let i=0;i<maxAxie;i++){
      const obj = this.createAxie();
      obj.unitId = i;
      obj.visible = false;
      this.axiePools.push(obj);
    }
  }

  private createGround() {
    const newGroundObject = new GroundObject();
    this.root.addChild(newGroundObject);

    return newGroundObject;
  }

  private createAxie() {
    const ranIdx = Math.trunc(Math.random() * this.spineDesc.length);
    const { id, mixer, atlasKeyMap } = this?.spineDesc[ranIdx];
    const figure = new Figure(mixer, atlasKeyMap, this.loader);

    figure.x = 0; //this.offsetWidth / 3;
    figure.y = 0; //this.offsetHeight;
    const scale = 0.08;
    figure.scale.x = -scale;
    figure.scale.y = scale;

    figure.state.setAnimation(0, 'action/idle/normal', true);

    figure.autoUpdate = false;
    figure.update(0);

    const axieObject = new AxieObject();
    // axieObject.unitId = unitId;
    axieObject.x = 0; //this.offsetWidth / 3;
    axieObject.y = 0; //this.offsetHeight;

    axieObject.currentSpine = figure;
    axieObject.addChild(figure);

    this.root.addChild(axieObject);

    return axieObject;
  }

  private createDoor() {
    const newDoorObject = new DoorObject();
    this.root.addChild(newDoorObject);
    return newDoorObject;
  }

  private createKey() {
    const newKeyObject = new KeyObject();
    for(const {name} of KEYS){
      const tex = this.loader.resources[name].texture;
      const model = new PIXI.Sprite(tex);
      model.anchor.set(0.5);
      model.scale.set(0.4 / this.root.scale.y);
      model.visible = false;
      newKeyObject.models.push(model);
      newKeyObject.addChild(model);
    }

    this.root.addChild(newKeyObject);
    return newKeyObject;
  }

  //***************** */
  newInstanseGround() {
    const freeIdx = this.groundPools.findIndex(x => !x.visible);
    let obj : GroundObject;
    if (freeIdx == -1){
      obj = this.createGround();
      this.groundPools.push(obj);
    } 
    else {
      obj = this.groundPools[freeIdx];
    }
    obj.visible = true;
    return obj;
  }

  newInstanseAxie() {
    const freeIdx = this.axiePools.findIndex(x => !x.visible);
    let obj : AxieObject;
    if (freeIdx == -1){
      obj = this.createAxie();
      this.axiePools.push(obj);
    } 
    else {
      obj = this.axiePools[freeIdx];
    }
    obj.visible = true;
    return obj;
  }

  newInstanseDoor() {
    const freeIdx = this.doorPools.findIndex(x => !x.visible);
    let obj : DoorObject;
    if (freeIdx == -1){
      obj = this.createDoor();
      this.doorPools.push(obj);
    } 
    else {
      obj = this.doorPools[freeIdx];
    }
    obj.visible = true;
    return obj;
  }

  newInstanseKey() {
    const freeIdx = this.keyPools.findIndex(x => !x.visible);
    let obj : KeyObject;
    if (freeIdx == -1){
      obj = this.createKey();
      this.keyPools.push(obj);
    } 
    else {
      obj = this.keyPools[freeIdx];
    }
    obj.visible = true;
    return obj;
  }
}
