import * as TGE from "./TileGameEvents"
import * as TG from "./tileGame"

const scene = new Entity()
let start

const mashineEntity = new Entity()
mashineEntity.setParent(scene)
const gltfShape = new GLTFShape('models/mashine.glb')
mashineEntity.addComponentOrReplace(gltfShape)
const transform_2 = new Transform({
  position: new Vector3(8, 0, 8),
  rotation: new Quaternion(0, 0, 0, 1),
  scale: new Vector3(1.6, 1.6, 1.6)
})
mashineEntity.addComponentOrReplace(transform_2)






var tileGame = new Entity("TileGame")
let tileGameTransform = new Transform({
  position: new Vector3(7.365, 1.95, 8.1),
  rotation: Quaternion.Euler(-25, 0, 0),
  scale: new Vector3(0.2, 0.2, 0.2)
})
tileGame.addComponent(tileGameTransform)
engine.addEntity(tileGame)

let TGS = new TG.TileGame(tileGame)



//init start quest button
let buttonEntity = new Entity()
let buttonTransform = new Transform({
  position: new Vector3(8.45, 1.098, 8.5),
  rotation: Quaternion.Euler(60, 0, 0),
  scale: new Vector3(0.41, 0.05, 0.35)
})

let buttonDefaultMaterial = new Material()
buttonDefaultMaterial.albedoColor = Color3.White()
buttonDefaultMaterial.emissiveColor = Color3.White()
buttonDefaultMaterial.emissiveIntensity = 1.5 

let buttonEmissevMaterial = new Material()
buttonEmissevMaterial.albedoColor = Color3.White()
buttonEmissevMaterial.emissiveColor = Color3.White()
buttonEmissevMaterial.emissiveIntensity = 3



buttonEntity.addComponent(new BoxShape())
buttonEntity.addComponent(buttonTransform)
buttonEntity.addComponent(buttonEmissevMaterial)
buttonEntity.addComponent(
    new OnClick(e => {
      buttonEntity.addComponentOrReplace(buttonDefaultMaterial)

      if(start != undefined)
      engine.removeEntity(start)
      
      start = new Entity();
      start.addComponent(new TGE.StartTiltGameEvent())
      engine.addEntity(start)
      //TGS.restart()
    })
)
buttonEntity.setParent(scene)


engine.addSystem(TGS)

engine.addEntity(scene)
