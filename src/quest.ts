import { Tools } from "./tools"
import { TileGame } from "./tileGame"

export class Quest
{
  private timeLimit = Tools.getSecondsFromMins(20) //20 mins 
  private started = false
  private timeLeft = this.timeLimit
  private parentEntity

  public get isStarted() : boolean {
    return this.started
  }
  
  public constructor(_p: Entity)
  {
    log("Quest inited")
    this.parentEntity = _p
  }

  public startQuest()
  {
    this.started = true
    log("Quest started")
  }

  public render()
  {
    
  }

  update(dt: number) 
  {
    if(this.started)
    {
      this.timeLeft-=dt
      if(this.timeLeft<=0)
      {
        this.started = false
        //и надо убить все объекты игр... хз как
      }
    }
  }
}