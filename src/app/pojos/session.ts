import { DocumentReference, DocumentSnapshot, SnapshotOptions, Timestamp } from "@angular/fire/firestore";
import { Label } from "./label";

export class Session {
    static readonly converter = {
        toFirestore: (session: Session) => {
            return {
                time_stamp: session.time_stamp,
                label: session.label instanceof Label ? session.label.ref : session.label,
                mode: session.mode,
                poms: session.poms,
                hr: session.hr,
                min: session.min,
                sec: session.sec,
                buff_hr: session.buff_hr,
                buff_min: session.buff_min,
                buff_sec: session.buff_sec
            };
        },
        fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
            const data = snapshot.data(options);
            return new Session(
                data!['time_stamp'],
                data!['label'],
                data!['mode'],
                data!['poms'],
                data!['hr'],
                data!['min'],
                data!['sec'],
                data!['buff_hr'],
                data!['buff_min'],
                data!['buff_sec']
            );
        }
    }
    time_stamp: Timestamp;
    label: DocumentReference | Label | undefined;

    mode: 'pom' | 'short_break' | 'break';
    poms: number;

    hr: number;
    min: number;
    sec: number;

    buff_hr: number;
    buff_min: number;
    buff_sec: number;

    constructor()
    constructor(time_stamp: Timestamp, label: DocumentReference | Label | undefined, mode: 'pom' | 'short_break' | 'break', poms: number, hr: number, min: number, sec: number, buff_hr: number, buff_min: number, buff_sec: number)
    constructor(time_stamp?: Timestamp, label?: DocumentReference | Label | undefined, mode?: 'pom' | 'short_break' | 'break', poms?: number, hr?: number, min?: number, sec?: number, buff_hr?: number, buff_min?: number, buff_sec?: number) {
        this.time_stamp = time_stamp ? time_stamp : Timestamp.now();
        this.label = label;

        this.mode = mode ? mode : 'pom';
        this.poms = poms ? poms : 0;

        this.hr = hr ? hr : 0;
        this.min = min ? min : 0;
        this.sec = sec ? sec : 0;

        this.buff_hr = buff_hr ? buff_hr : 0;
        this.buff_min = buff_min ? buff_min : 0;
        this.buff_sec = buff_sec ? buff_sec : 0;
    }

}