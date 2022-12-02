import { DocumentReference, DocumentSnapshot, SnapshotOptions, Timestamp } from "@angular/fire/firestore";
import { Time } from "./time";

export class Session {
    static readonly converter = {
        toFirestore: (session: Session) => {
            return {
                time_stamp: session.time_stamp,
                work_entry: session.work_entry,
                mode: session.mode,
                poms: session.poms,
                pom: { target: session.pom.target.secs, display: session.pom.display.secs },
                break: { target: session.break.target.secs, display: session.break.target.secs }
            };
        },
        fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
            const data = snapshot.data(options);
            return new Session(
                data!['time_stamp'],
                data!['work_entry'],
                data!['mode'],
                data!['poms'],
                data!['pom'],
                data!['break'],
                snapshot.ref
            );
        }
    }
    static readonly update = (session: Session)=>{
        return {
            work_entry: session.work_entry,
            mode: session.mode,
            poms: session.poms,
            pom: { target: session.pom.target.secs, display: session.pom.display.secs },
            break: { target: session.break.target.secs, display: session.break.target.secs }
        };
    }
    public time_stamp: Timestamp;
    public work_entry!: DocumentReference | undefined;

    public mode: 'pom' | 'break';
    public poms: number;

    public pom: { target: Time, display: Time };
    public break: { target: Time, display: Time };
    public ref!: DocumentReference;

    constructor(time_stamp?: Timestamp, work_entry?: DocumentReference | undefined, mode?: 'pom' | 'break', poms?: number, pom?: { target: number, display: number }, _break?: { target: number, display: number }, ref?: DocumentReference) {
        this.time_stamp = time_stamp ? time_stamp : Timestamp.now();

        this.work_entry = work_entry;
        this.mode = mode ? mode : 'break';

        this.poms = poms ? poms : 0;

        this.pom = pom ? { target: new Time(pom.target), display: new Time(pom.display) } : { target: new Time(0), display: new Time(0) };
        this.break = _break ? { target: new Time(_break.target), display: new Time(_break.display) } : { target: new Time(0), display: new Time(0) };

        if (ref) this.ref = ref;
    }

}