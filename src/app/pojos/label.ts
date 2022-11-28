import { DocumentReference, DocumentSnapshot, SnapshotOptions } from "@angular/fire/firestore";

export class Label {
    static readonly converter = {
        toFirestore: (label: Label) => {
            return {
                color: label.color,
                name: label.name,
                removed: label.removed
            };
        },
        fromFirestore: (snapshot: DocumentSnapshot, options: SnapshotOptions) => {
            const data = snapshot.data(options);
            return new Label(
                data!['color'],
                data!['name'],
                data!['removed'],
                snapshot.ref
            );
        }
    }
    public color: string;
    public name: string;

    public removed: boolean
    public ref!: DocumentReference;

    constructor(color: string, name: string, removed?: boolean,  ref?: DocumentReference) {
        this.color = color;
        this.name = name;
        this.removed = removed? removed: false;
        if (ref)
            this.ref = ref
    }



}