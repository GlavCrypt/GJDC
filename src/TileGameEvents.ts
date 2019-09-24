@Component("StartTiltGameEvent")
export class StartTiltGameEvent { }

@Component("TileClickEvent")
export class TileClickEvent {
    public x: number
    public y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}