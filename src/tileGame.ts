import * as TGE from "./TileGameEvents"
import { Tools } from "./tools"

const clip = new AudioClip('audio/blink.mp3')
const source = new AudioSource(clip)

const startEvents = engine.getComponentGroup(TGE.StartTiltGameEvent)
const clickEvents = engine.getComponentGroup(TGE.TileClickEvent)

enum S {
  isPlaying = 1,
  isReading = 2
}
   
export class TileGame implements ISystem {

  private parent: Entity
  private tiles: Tile[][]
  private tileEmisseveMaterial
    private tileDefaultMaterial

    private sequence: [number, number][]
    private tileDuration: number

    private lastClick: [number, number]

  constructor(parent: Entity) {
      this.parent = parent
       //this.start() 
  }

    public restart(){
        this.sequence = []

        log("tilt game restarted")
    }
    private start() {
  
        this.tileDuration = 1
        this.sequence = []

        let audioSourceEntity = new Entity("AudioSource")
        audioSourceEntity.addComponent(source)
        audioSourceEntity.setParent(this.parent)

        log("tilt game inited")
        this.tileDefaultMaterial = new Material()
        this.tileDefaultMaterial.albedoColor = Color3.Black()
        this.tileDefaultMaterial.emissiveColor = Color3.Black()
        this.tileDefaultMaterial.emissiveIntensity = 0
 
        this.tiles = []
        for (let y = 0; y < 3; y += 1) {
            this.tiles[y] = []
            for (let x = 0; x < 3; x += 1) {

                let tileEntity = new Entity()
                tileEntity.setParent(this.parent)
                tileEntity.addComponent(new BoxShape())
                tileEntity.addComponent(this.tileDefaultMaterial)
                tileEntity.addComponent(new Transform({
                    position: new Vector3(x, y, 0),
                    rotation: Quaternion.Euler(90, 0, 0),
                    scale: new Vector3(1, 0.05, 1)
                }))

                let color = colorList9[x + y * 3]
                let emisseveMaterial = new Material()
                emisseveMaterial.albedoColor = Color3.White()
                emisseveMaterial.emissiveColor = color
                emisseveMaterial.emissiveIntensity = 5

                let tile = new Tile(x, y, this.tileDefaultMaterial, emisseveMaterial, tileEntity)
                tileEntity.addComponent(tile)
                this.tiles[y][x] = tile

                tileEntity.addComponent(
                    new OnClick(e => {
                        let entity = new Entity();
                        entity.addComponent(new TGE.TileClickEvent(x, y))
                        engine.addEntity(entity)
                    }))
            }
        }

        executeTask(async () => {

            try {
                await delay(3000)
                this.sequence.push(randomPositionExcept([-1, -1]))

                let score = 0

                while (true) {
                    for (let xy of this.sequence) {
                        this.setTileActive(xy, true)
                        await delay(this.tileDuration * 1000)
                        this.setTileActive(xy, false)
                    }

                    

                    let wrong = false;
                    for (let i = 0; i < this.sequence.length; i++) {
                        this.lastClick = null
                        while (this.lastClick == null)
                            await delay(50)

                        wrong = wrong ||
                            this.lastClick[0] != this.sequence[i][0] ||
                            this.lastClick[1] != this.sequence[i][1]

                        this.setTileActive(this.lastClick, true)
                        await delay(this.tileDuration * 200)
                        this.setTileActive(this.lastClick, false)
                    }

                    if (wrong)
                        break;

                    await delay(this.tileDuration * 500)
                    score += 1

                    let lastElement = this.sequence[this.sequence.length - 1]
                    this.sequence.push(randomPositionExcept(lastElement))
                }

                log("GOOD GAME. YOU SCORE IS " + score)
            }
            catch (ex) {
                log(ex)
            }
        }) 
    }

    update(dt: number) {
        for (let entity of startEvents.entities) {

            log("start event")

            engine.removeEntity(entity)

            this.start()
        }

        for (let entity of clickEvents.entities) {
            engine.removeEntity(entity)

            let clickEvent = entity.getComponent(TGE.TileClickEvent)
            this.lastClick = [clickEvent.x, clickEvent.y]
        }
    }

    /*private toggle(x: number, y: number) {
        this.tiles[y][x].toggle()
    }*/

    private setTileActive(xy: [number, number], value: boolean) {
        this.tiles[xy[1]][xy[0]].setActive(value)
    }
}

function randomPositionExcept(i: [number, number]): [number, number] {
    let randX = Tools.getRandomInt(3)
    let randY = Tools.getRandomInt(3)

    while (randX == i[0] && randY == i[1]) {
        randX = Tools.getRandomInt(3)
        randY = Tools.getRandomInt(3)
    }

    return [randX, randY]
}

function delay(ms: number) {
    return new Promise(resolve => globalThis.setTimeout(resolve, ms));
}

const colorList9 = [
    Color3.Red(),
    Color3.Yellow(),
    Color3.Blue(),
    Color3.Green(),
    Color3.Purple(),
    Color3.Teal(),
    Color3.Magenta(),
    Color3.Gray(),
    Color3.White()
]

@Component("Tile")
class Tile {
    private x: number
    private y: number
    private entity: Entity
  private isEmissive: boolean
  private defaultMaterial: Material
  private emisseveMaterial: Material

    constructor(x: number, y: number, defaultMaterial: Material, emissiveMaterial: Material, entity: Entity) {
        this.x = x
        this.y = y
        log(x + ":" + y + " tilt inited")
         this.defaultMaterial = defaultMaterial
        this.emisseveMaterial = emissiveMaterial
        this.entity = entity
        this.isEmissive = false;
  }

    public setActive(value: boolean) {
        if (value) {
            this.entity.addComponentOrReplace(this.emisseveMaterial)
            this.isEmissive = true
            source.volume = 1
            source.playOnce()
        }
        else {
            this.entity.addComponentOrReplace(this.defaultMaterial)
            this.isEmissive = false
        }
    }

  /*public toggle() {
    if (this.isEmissive == false) {
      this.entity.addComponentOrReplace(this.emisseveMaterial)
      this.isEmissive = true
      source.volume = 1
      //source.playOnce()
      source.playing = true
      source.loop = true
      log("play")
    }
    else {
      this.entity.addComponentOrReplace(this.defaultMaterial)
      this.isEmissive = false
      log("play")
    }
  }*/
}

