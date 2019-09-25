import * as TGE from "./TileGameEvents"
import * as TG from "./tileGame"

const scene = new Entity()

const mashineEntity = new Entity()
mashineEntity.addComponent(new GLTFShape('models/mashine.glb'))
mashineEntity.addComponent(new Transform({
  position: new Vector3(8, 0, 8),
  rotation: new Quaternion(0, 0, 0, 1),
  scale: new Vector3(1.6, 1.6, 1.6)
}))
mashineEntity.setParent(scene)


let buttonDefaultMaterial = new Material()
buttonDefaultMaterial.albedoColor = Color3.White()
buttonDefaultMaterial.emissiveColor = Color3.White()
buttonDefaultMaterial.emissiveIntensity = 1.5 

let buttonEmissevMaterial = new Material()
buttonEmissevMaterial.albedoColor = Color3.White()
buttonEmissevMaterial.emissiveColor = Color3.White()
buttonEmissevMaterial.emissiveIntensity = 3


//init start quest button
let buttonEntity = new Entity()
buttonEntity.addComponent(new Transform({
    position: new Vector3(8.45, 1.098, 8.5),
    rotation: Quaternion.Euler(60, 0, 0),
    scale: new Vector3(0.41, 0.05, 0.35)
}))
buttonEntity.addComponent(new BoxShape())
buttonEntity.addComponent(buttonEmissevMaterial)
buttonEntity.addComponent(
    new OnClick(e => {
      buttonEntity.addComponentOrReplace(buttonDefaultMaterial)

      const playCommand = new Entity();
      playCommand.addComponent(new TGE.PlayTiltGameCommand())
      engine.addEntity(playCommand)
    })
)
buttonEntity.setParent(scene)


engine.addEntity(scene)


var tileGameEntity = new Entity("TileGame")
tileGameEntity.addComponent(new Transform({
    position: new Vector3(7.365, 1.95, 8.1),
    rotation: Quaternion.Euler(-25, 0, 0),
    scale: new Vector3(0.2, 0.2, 0.2)
}))
tileGameEntity.setParent(scene)

const tileGame = new TG.TileGame(tileGameEntity)
engine.addSystem(tileGame)
