
export const MAP_SIZE = 12;

export const MAP_CODE_WALL = 1000;
export const MAP_CODE_CLEAR = 1001;
export const MAP_CODE_DOOR_A = 1100;
export const MAP_CODE_DOOR_B = 1101;

export const MAP_CODE_START = 2000;
export const MAP_CODE_END = 2001;
export const MAP_CODE_KEY_A = 2100;
export const MAP_CODE_KEY_B = 2101;

export const KEYS = [{
    name: "key-a"
},{
    name: "key-b"
}
];

export  class ItemState{
    code: number;
    mapX: number;
    mapY: number;
    available: boolean;
    constructor(){
        this.code = 0;
        this.mapX = 0;
        this.mapY = 0;
        this.available = true;
    }
}

class ConsumableItemStates {
    [name: string]: number
};

export  class AxieState{
    hp: number;
    mapX: number;
    mapY: number;
    consumableItems: ConsumableItemStates;

    constructor(){
        this.hp = 0;
        this.mapX = 0;
        this.mapY = 0;
        this.consumableItems = {};
    }
}

export  class DoorState{
    level: number;
    colMapX: number;
    colMapY: number;
    locked: boolean;
    constructor(){
        this.level = 0;
        this.colMapX = 0;
        this.colMapY = 0;
        this.locked = true;
    }
}

export  class FloorState{
    map: Array<Array<number>>;
    itemStates: Array<ItemState>;
    doorStates: Array<DoorState>;

    constructor(map: Array<Array<number>>, itemStates: Array<ItemState>, doorStates: Array<DoorState>){
        this.map = map;
        this.itemStates = itemStates;
        this.doorStates = doorStates;
    }
}

export class ChangeLogs {
    [name: string]: string
};

export  class MazeState{
    floors: Array<FloorState>;
    axie: AxieState;
    currentFloorIdx: number;
    isWon: boolean;

    constructor(){
        this.floors = [];

        this.currentFloorIdx = 0;
        this.axie = new AxieState();
        this.isWon = false;
    }

    loadMaps(floorMaps: string[]){
        this.floors = []

        this.axie.hp = 2;
        this.axie.consumableItems = {};
        this.currentFloorIdx = 0;
        this.isWon = false;

        for(let k=0;k<floorMaps.length;k++){
            const map = new Array();
            const itemStates = new Array();
            const doorStates = new Array();
            for (let i = 0; i < MAP_SIZE * 2 + 1; i++) {
              const line = new Array();
              map.push(line);
              for (let j = 0; j < MAP_SIZE * 2 + 1; j++) {
                let code = MAP_CODE_WALL;
                if(i % 2 == 1 && j % 2 == 0){
                  const x = Math.trunc(j / 2);
                  const y = Math.trunc(i / 2);
                  const val = floorMaps[k][i * (MAP_SIZE * 2 + 1) + j];
                  if(val == '|'){
                    code = MAP_CODE_WALL;
                  } else if(val == 'D'){
                    code = MAP_CODE_DOOR_A;
                  } else if(val == 'E'){
                    code = MAP_CODE_DOOR_B;
                  } else {
                    code = MAP_CODE_CLEAR;
                  }

                  if(code >= MAP_CODE_DOOR_A && code <= MAP_CODE_DOOR_B){
                    const doorState = new DoorState();
                    doorState.colMapX = j;
                    doorState.colMapY = i;
                    doorState.level = code - MAP_CODE_DOOR_A;
                    doorStates.push(doorState);
                  }
                } else if(i % 2 == 0 && j % 2 == 1){
                  const x = Math.trunc(j / 2);
                  const y = Math.trunc(i / 2);
                  const val = floorMaps[k][i * (MAP_SIZE * 2 + 1) + j];
                  if(val == '_'){
                    code = MAP_CODE_WALL;
                  } else if(val == 'D'){
                    code = MAP_CODE_DOOR_A;
                  } else if(val == 'E'){
                    code = MAP_CODE_DOOR_B;
                  } else {
                    code = MAP_CODE_CLEAR;
                  }

                  if(code >= MAP_CODE_DOOR_A && code <= MAP_CODE_DOOR_B){
                    const doorState = new DoorState();
                    doorState.colMapX = j;
                    doorState.colMapY = i;
                    doorState.level = code - MAP_CODE_DOOR_A;
                    doorStates.push(doorState);
                  }
                } else if(i % 2 == 1 && j % 2 == 1){
                  const x = Math.trunc(j / 2);
                  const y = Math.trunc(i / 2);
                  const val = floorMaps[k][i * (MAP_SIZE * 2 + 1) + j];
                  switch(val){
                    case 's': {
                        code = MAP_CODE_START; 
                        if(k == 0){
                            this.axie.mapX = x;
                            this.axie.mapY = y;
                        }
                        break;
                    }
                    case 't': code = MAP_CODE_END; break;
                  
                    case 'k': code = MAP_CODE_KEY_A; break;
                    case 'l': code = MAP_CODE_KEY_B; break;
                  }
                  if(code >= MAP_CODE_KEY_A && code <= MAP_CODE_KEY_B){
                    const itemState = new ItemState();
                    itemState.mapX = x;
                    itemState.mapY = y;
                    itemState.code = code;
                    itemStates.push(itemState);
                  }
                }
      
                line.push(code);
              }
            }

            const floorState = new FloorState(map, itemStates, doorStates);
            this.floors.push(floorState);
          }
    }

    onMove(dx: number, dy: number){
        if(this.axie.hp <= 0 || (Math.abs(dx) + Math.abs(dy) != 1)) return {'action': 'none'};

        const floorMap = this.floors[this.currentFloorIdx];
    
        const nx = this.axie.mapX + dx;
        const ny = this.axie.mapY + dy;
        if(nx < 0 || nx >= MAP_SIZE || ny < 0 || ny >= MAP_SIZE) return {'action': 'none'};
        let wallVal = MAP_CODE_CLEAR;
        let colMapX, colMapY;
        if(dx != 0){
            colMapX = (this.axie.mapX + (dx == 1 ? 1 : 0)) * 2;
            colMapY = this.axie.mapY * 2 + 1;
          wallVal = floorMap.map[colMapY][colMapX]
        } else {
            colMapX = this.axie.mapX * 2 + 1;
            colMapY = (this.axie.mapY + (dy == 1 ? 1 : 0)) * 2;
          wallVal = floorMap.map[colMapY][colMapX];
        }

        const logs: ChangeLogs = {};
        if(wallVal != MAP_CODE_CLEAR) {
            if(wallVal >= MAP_CODE_DOOR_A && wallVal <= MAP_CODE_DOOR_B){
                this.unlockDoor(floorMap, colMapX, colMapY, logs);
                return logs;
            } else {
                return {'action': 'none'};
            }
        }
        const newRoomVal = floorMap.map[ny * 2 + 1][nx * 2 + 1];
    
        if(newRoomVal == MAP_CODE_START && this.currentFloorIdx > 0){
            this.currentFloorIdx -= 1;
            logs['action'] = 'enterFloor';
        } else if(newRoomVal == MAP_CODE_END){
            if((this.currentFloorIdx < this.floors.length - 1)){
                this.currentFloorIdx += 1;
                logs['action'] = 'enterFloor';
            } else{
                this.isWon = true;
                logs['action'] = 'enterFloor';
            }
        } else if(newRoomVal >= MAP_CODE_KEY_A && newRoomVal <= MAP_CODE_KEY_B){
            this.gainKey(floorMap, nx, ny, logs);
        } else{
            logs['action'] = 'move';
        }
        
        this.axie.mapX = nx;
        this.axie.mapY = ny;

        return logs;
    }

    private gainKey(floorState: FloorState, targetMapX: number, targetMapY: number, logs: ChangeLogs){
        const itemState = floorState.itemStates.find(x => x.mapX == targetMapX && x.mapY == targetMapY);
        if(itemState == null){
            logs['action'] = 'none';
            return false;
        }
        logs['action'] = 'gainKey';

        floorState.map[targetMapY * 2 + 1][targetMapX * 2 + 1] = MAP_CODE_CLEAR;
        itemState.available = false;
        const keyId = 'key-' + String.fromCharCode('a'.charCodeAt(0) + itemState.code - MAP_CODE_KEY_A);
        if(this.axie.consumableItems.hasOwnProperty(keyId)){
            this.axie.consumableItems[keyId] += 1;
        } else {
            this.axie.consumableItems[keyId] = 1;
        }
    }

    private unlockDoor(floorState: FloorState, colMapX: number, colMapY: number, logs: ChangeLogs){
        const doorLevel = floorState.map[colMapY][colMapX] - MAP_CODE_DOOR_A;
        const keyId = 'key-' + String.fromCharCode('a'.charCodeAt(0) + doorLevel);

        if(this.axie.consumableItems.hasOwnProperty(keyId)){
            if(this.axie.consumableItems[keyId] >= 1){
                const doorState = floorState.doorStates.find(x => x.colMapX == colMapX && x.colMapY == colMapY);
                if(doorState == null){
                    logs['action'] = 'none';
                    return false;
                }
                this.axie.consumableItems[keyId] -= 1;
                floorState.map[colMapY][colMapX] = MAP_CODE_CLEAR;
                doorState.locked = false;
                logs['action'] = 'unlockDoor';
            }
        } else {
            logs['action'] = 'none';
            return false;
        }
    }
}
