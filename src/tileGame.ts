import * as TGE from "./TileGameEvents"
import * as Tools from "./tools"

const clip = new AudioClip('audio/blink.mp3')
const source = new AudioSource(clip)

const playCommands = engine.getComponentGroup(TGE.PlayTiltGameCommand)
const stopCommands = engine.getComponentGroup(TGE.StopTiltGameCommand)
const clickEvents = engine.getComponentGroup(TGE.TileClickEvent)
   
export class TileGame implements ISystem {

    private parent: Entity
    private tiles: Tile[][]
    private audioSourceEntity: Entity

    private cancelToken: Tools.CancelToken

    private sequence: [number, number][]
    private tileDuration: number

    private lastClick: [number, number]

    constructor(parent: Entity) {
        this.parent = parent
    }

    activate() {

        // create all entities when engine.addSystem(tileGame)

        this.audioSourceEntity = new Entity("AudioSource")
        this.audioSourceEntity.addComponent(source)
        this.audioSourceEntity.setParent(this.parent)

        log("tileGame: creating tiles")
        let tileDefaultMaterial = new Material()
        tileDefaultMaterial.albedoColor = Color3.Black()
        tileDefaultMaterial.emissiveColor = Color3.Black()
        tileDefaultMaterial.emissiveIntensity = 0

        this.tiles = []
        for (let y = 0; y < 3; y += 1) {
            this.tiles[y] = []
            for (let x = 0; x < 3; x += 1) {

                let tileEntity = new Entity()
                tileEntity.setParent(this.parent)
                tileEntity.addComponent(new BoxShape())
                tileEntity.addComponent(tileDefaultMaterial)
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

                let tile = new Tile(x, y, tileDefaultMaterial, emisseveMaterial, tileEntity)
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
    }

    deactivate() {

        // remove all entities when engine.removeSystem(tileGame)

        this.stop()
        engine.removeEntity(this.audioSourceEntity)

        for (let y = 0; y < 3; y += 1) {
            for (let x = 0; x < 3; x += 1) {
                const tile = this.tiles[y][x]
                engine.removeEntity(tile.entity)
                this.tiles[y][x] = null
            }
        }
    }

    update(dt: number) {

        for (let entity of stopCommands.entities) {
            engine.removeEntity(entity)

            log("tileGame: stop event")
            this.stop()
        }

        for (let entity of playCommands.entities) {
            engine.removeEntity(entity)

            log("tileGame: start event")
            this.startOrRestart()
        }

        for (let entity of clickEvents.entities) {
            engine.removeEntity(entity)

            let clickEvent = entity.getComponent(TGE.TileClickEvent)
            this.lastClick = [clickEvent.x, clickEvent.y]
        }
    }

    private startOrRestart() {
        const isStarted = this.cancelToken != null && !this.cancelToken.isCancelled;
        if (isStarted) {

            this.stop()
            this.start()
        }
        else {
            this.start()
        }
    }

    private start() {

        this.cancelToken = new Tools.CancelToken()

        this.tileDuration = .75
        this.sequence = []

        executeTask(async () => {

            try {

                // reset board
                for (let y = 0; y < 3; y += 1) {
                    for (let x = 0; x < 3; x += 1) {
                        this.setTileActive([x, y], false)
                    }
                }

                await delayWithCancel(750, this.cancelToken)
                this.sequence.push(randomPositionExcept([-1, -1]))

                let score = 0

                while (true) {
                    // play sequence
                    for (let xy of this.sequence) {
                        this.setTileActive(xy, true)
                        await delayWithCancel(this.tileDuration * 1000, this.cancelToken)
                        this.setTileActive(xy, false)
                    }

                    // read input
                    this.lastClick = null
                    let wrong = false;
                    let lastInputPos = [-1, -1]
                    for (let i = 0; i < this.sequence.length; i++) {
                        while (this.lastClick == null ||
                               (this.lastClick[0] == lastInputPos[0] &&
                                this.lastClick[1] == lastInputPos[1])) {
                            await delayWithCancel(50, this.cancelToken)
                        }

                        wrong = wrong ||
                            this.lastClick[0] != this.sequence[i][0] ||
                            this.lastClick[1] != this.sequence[i][1]

                        let activeTile = this.lastClick
                        lastInputPos = this.lastClick
                        this.lastClick = null

                        this.setTileActive(activeTile, true)
                        await delayWithCancel(this.tileDuration * 1000, this.cancelToken)
                        this.setTileActive(activeTile, false)
                    }

                    if (wrong)
                        break;

                    score += 1
                    await delayWithCancel(300, this.cancelToken)

                    // add new element to sequence
                    let lastElement = this.sequence[this.sequence.length - 1]
                    this.sequence.push(randomPositionExcept(lastElement))
                }

                log("GOOD GAME. YOU SCORE IS " + score)
            }
            catch (ex) {
                log("tilGame execution error:")
                log(ex)
            }
        })
    }

    private stop() {
        this.cancelToken.cancel("tileGame.startOrRestart()")
    }

    private setTileActive(xy: [number, number], value: boolean) {
        this.tiles[xy[1]][xy[0]].setActive(value)
    }
}

function randomPositionExcept(i: [number, number]): [number, number] {
    let randX = Tools.Tools.getRandomInt(3)
    let randY = Tools.Tools.getRandomInt(3)

    while (randX == i[0] && randY == i[1]) {
        randX = Tools.Tools.getRandomInt(3)
        randY = Tools.Tools.getRandomInt(3)
    }

    return [randX, randY]
}

function delay(ms: number) {
    return new Promise(resolve => globalThis.setTimeout(resolve, ms));
}

function delayWithCancel(ms: number, token: Tools.CancelToken) {
    return new Promise((resolve, reject) => {

        token.onCancelled = reject
        globalThis.setTimeout(resolve, ms)
    });
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
export class Tile {

    public x: number
    public y: number
    public entity: Entity
    public isActive: boolean

    private defaultMaterial: Material
    private activeMaterial: Material

    constructor(x: number, y: number, defaultMaterial: Material, activeMaterial: Material, entity: Entity) {
        this.x = x
        this.y = y
        log("Creating Tile [" + x + ":" + y + "].")
        this.defaultMaterial = defaultMaterial
        this.activeMaterial = activeMaterial
        this.entity = entity
        this.isActive = false;
    }

    public setActive(value: boolean) {
        if (value) {
            this.entity.addComponentOrReplace(this.activeMaterial)
            this.isActive = true
            source.volume = 1
            source.playOnce()
        }
        else {
            this.entity.addComponentOrReplace(this.defaultMaterial)
            this.isActive = false
        }
    }
}

