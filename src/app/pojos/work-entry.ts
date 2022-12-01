import { DocumentReference, DocumentSnapshot, SnapshotOptions, Timestamp } from "@angular/fire/firestore";
import { Label } from "./label";
import { Time } from "./time";

export class WorkEntry {
    static readonly converter = {
        toFirestore: (work_entry: WorkEntry) => {
            return {
                time_stamp: work_entry.time_stamp,
                time: work_entry.time.time,
                label: work_entry.label
            };
        }, fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
            const data = snapshot.data(options);
            return new WorkEntry(
                data!['time_stamp'],
                data!['time'],
                data!['label'],
                snapshot.ref
            );
        }
    }
    static readonly update = (work_entry: WorkEntry) => {
        return {
            time: work_entry.time.time,
            label: work_entry.label
        }
    }
    public time_stamp: Timestamp;
    public time: Time;
    public label!: DocumentReference;
    public ref!: DocumentReference;

    constructor(time_stamp?: Timestamp, time?: number, label?: DocumentReference, ref?: DocumentReference) {
        this.time_stamp = time_stamp ? time_stamp : Timestamp.now();
        this.time = time ? new Time(time) : new Time(0);

        if (label) this.label = label;
        if (ref) this.ref = ref;
    }

    public get workTime() {
        return this.time.time;
    }

    public set workTime(time: number) {
        this.time.time = time;
    }
}