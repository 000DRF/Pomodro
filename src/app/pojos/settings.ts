import { DocumentSnapshot } from "@angular/fire/firestore";

export class Settings {
    static converter(snapshot: DocumentSnapshot): Settings {
        if (snapshot.exists()) {
            const data = snapshot.data()['settings'];
            if (data)
                return new Settings( data['pom'], data['break'], data['short_break'], data['auto_pom'], data['auto_break'], data['cost'], data!['sound'], data['notifications']);
        }
        return new Settings()
    }

    public pom: number;
    public break: number;
    public short_break: number;
    public auto_pom: boolean;
    public auto_break: boolean;
    public cost: number;
    public sound: boolean;
    public notifications: boolean;

    constructor()
    constructor(pom: number, _break: number, short_break: number, auto_pom: boolean, auto_break: boolean, cost: number, sound: boolean, notifications: boolean)
    constructor(pom?: number, _break?: number, short_break?: number, auto_pom?: boolean, auto_break?: boolean, cost?: number, sound?: boolean, notifications?: boolean) {
        this.pom = pom ? pom : 25;
        this.break = _break ? _break : 15;
        this.short_break = short_break ? short_break : 5;
        this.auto_pom = auto_pom ? auto_pom : false;
        this.auto_break = auto_break ? auto_break : false;
        this.cost = cost ? cost : 4;
        this.sound = sound ? sound : true;
        this.notifications = notifications ? notifications : false;
    }
}
