
export class Tools
{
  public static getSecondsFromMins(mins: number)
  {
    return mins*60*1000
  }

  public static getSecondsFromSec(sec: number)
  {
    return sec*60*1000
  }

  public static getRandomInt(max: number) 
  {
    return Math.floor(Math.random() * Math.floor(max));
  }

  public static getX(n: number){
    let x
    x = Math.round(n/3)
    return x
  }

  public static getY(n: number){
    let y
    y = y = n%3
    return y
  }
  
}