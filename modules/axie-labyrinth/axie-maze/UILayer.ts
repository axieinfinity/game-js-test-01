const INVENTORY_NAMES = [
    'key-a',
    'key-b'
];

export class InventorySlot extends PIXI.Container {
    model: PIXI.Sprite;
    amoutText: PIXI.Text;

    constructor(spr: PIXI.Sprite) {
        super();
        this.model = spr;
        this.addChild(spr);

        this.amoutText = new PIXI.Text('0', {
            fontFamily: 'Work Sans',
            fontSize: 20,
            stroke: '#4a1850',
            // strokeThickness: 5,
            fill: 'white',
            align: 'left',
        });
        this.addChild(this.amoutText);
        
    }
}

export class UILayer extends PIXI.Container {
    frameResult?: PIXI.Container;
   
    resultText?: PIXI.Text;
    restartCountdownText?: PIXI.Text;
    inventorys: Array<InventorySlot>;

    constructor() {
        super();
        this.inventorys = [];
    }

    init(offsetWidth: number, offsetHeight: number, canvasScale: number, loader: PIXI.loaders.Loader) {
        const frameResult = PIXI.Sprite.fromImage('/sprites/frame-result.png');
        frameResult.anchor.set(0.5);
        frameResult.scale.set(canvasScale);
        frameResult.x = offsetWidth / 2;
        frameResult.y = offsetHeight / 2;
        this.addChild(frameResult);
        this.frameResult = frameResult;

        const resultText = this.newTextObj(64);
        resultText.style.fontFamily = "Changa One";
        resultText.x = 0;
        resultText.y = -30;
        resultText.style.fill = "#412E2E";
        frameResult.addChild(resultText);
        resultText.text = "YOU LOSE!!!";
        this.resultText = resultText;

        const restartCountdownText = this.newTextObj(28);
        restartCountdownText.x = 0;
        restartCountdownText.y = 80;
        restartCountdownText.style.fill = "#412E2E";
        frameResult.addChild(restartCountdownText);
        restartCountdownText.text = "Tap to restart";
        restartCountdownText.x = -restartCountdownText.width / 2;
        this.restartCountdownText = restartCountdownText;
        
        const fullscreen = PIXI.Sprite.fromImage('/sprites/frame-fullscreen.png');
        fullscreen.anchor.set(0.5);
        fullscreen.scale.set(canvasScale);
        fullscreen.position.set(offsetWidth - 66 * canvasScale / 2, 66 * canvasScale / 2);
        fullscreen.interactive = true;
        this.addChild(fullscreen);
        fullscreen.on('pointerdown', (event) => { 
        //@ts-ignore
        if(document.documentElement.requestFullscreen) {
            //@ts-ignore
            document.documentElement.requestFullscreen();
            //@ts-ignore
        } else if(document.documentElement.mozRequestFullScreen) {
            //@ts-ignore
            document.documentElement.mozRequestFullScreen();
            //@ts-ignore
        } else if(document.documentElement.webkitRequestFullscreen) {
            //@ts-ignore
            document.documentElement.webkitRequestFullscreen();
            //@ts-ignore
        } else if(document.documentElement.msRequestFullscreen) {
            //@ts-ignore
            document.documentElement.msRequestFullscreen();
        }
        });

        for(let i=0;i<INVENTORY_NAMES.length;i++){
            const tex = loader.resources[INVENTORY_NAMES[i]].texture;
            const spr = new PIXI.Sprite(tex);
            spr.anchor.set(0.5);
            spr.scale.set((50 / tex.height) * canvasScale);
            const slot = new InventorySlot(spr);
            slot.x = 190 + i * 80;
            slot.y = 25;
            this.addChild(slot);
            this.inventorys.push(slot);
        }
    }

    newTextObj(fontSize: number) {
        const txt = new PIXI.Text('0/0', {
            fontFamily: 'Work Sans',
            fontSize: fontSize,
            stroke: '#4a1850',
            // strokeThickness: 5,
            fill: 'white',
            align: 'left',
        });
        return txt;
    }

    setInventoryStates(consumableItems: any){
        const visibleSlots = [];
        let offsetX = 190;
        for(let i=0;i<INVENTORY_NAMES.length;i++){
            this.inventorys[i].visible = false;
            if(consumableItems.hasOwnProperty(INVENTORY_NAMES[i]) && consumableItems[INVENTORY_NAMES[i]] > 0){
                visibleSlots.push(i);
                this.inventorys[i].visible = true;
                this.inventorys[i].amoutText.text = consumableItems[INVENTORY_NAMES[i]].toString();
                this.inventorys[i].x = offsetX;
                offsetX += 80;
            }
        }
    }

    setResultFrame(b:boolean){
        if(this.frameResult != null){
            this.frameResult.visible = b;
        }
    }

    setResultText(isWon: boolean){
        if(this.resultText != undefined){
            if(isWon){
                this.resultText.text = `YOU WIN!!!`;
            } else{
                this.resultText.text = `YOU LOSE!!!`;
            }
            this.resultText.x = -this.resultText.width / 2;
        }
    }
}
