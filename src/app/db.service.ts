import { Injectable } from '@angular/core';
import { addDoc, collection, doc, docSnapshots, DocumentReference, Firestore, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { deleteDoc } from '@firebase/firestore';
import { AuthService } from './auth.service';
import { Label } from './pojos/label';
import { Session } from './pojos/session';
import { WorkEntry } from './pojos/work-entry';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private auth: AuthService, private db: Firestore) { }

  public pullSession() {
    const sod = new Date();
    const eod = new Date();
    // start of day
    sod.setHours(0);
    sod.setMinutes(0);
    sod.setSeconds(0);
    // end of day
    eod.setHours(23);
    eod.setMinutes(59);
    eod.setSeconds(59);

    const sessionsRef = collection(this.db, this.auth.user_path + '/sessions');
    const q = query(sessionsRef, where('time_stamp', '>=', sod), where('time_stamp', '<=', eod)).withConverter(Session.converter)

    return getDocs(q);
  }

  public pullLabels() {
    const labelsRef = collection(this.db, this.auth.user_path + '/labels');
    const q = query(labelsRef, orderBy("name", "asc"), where('removed', '==', false)).withConverter(Label.converter);
    return getDocs(q);
  }

  public async pullLabel(label_ref: DocumentReference) {
    const doc = await getDoc(label_ref.withConverter(Label.converter));
    return doc.get('removed') ? undefined : doc.data();
  }

  public async pullWorkEntry(work_entry_ref: DocumentReference) {
    const doc = await getDoc(work_entry_ref.withConverter(WorkEntry.converter))
    return doc.data()
  }

  public async findWorkEntry(path:string, label_ref: DocumentReference){
    const workEntries = collection(this.db, path + 'work')
    const q = query(workEntries, where('label', '==', label_ref)).withConverter(WorkEntry.converter)
    return getDocs(q);
  }

  public async pullSettings() {
    const ref = doc(this.db, this.auth.user_path);
    return await getDoc(ref);
  }

  public pushSettings(settings: any) {
    const ref = doc(this.db, this.auth.user_path);
    return setDoc(ref, { settings: settings }, { merge: true });
  }

  public pushLabel(label: Label) {
    return addDoc(collection(this.db, this.auth.user_path + '/labels').withConverter(Label.converter), label);
  }

  public async rmLabel(label: Label) {
    await getDoc(label.ref)
      // Check if referenced, 
      .then(async (docSnap) => {
        if (docSnap.get('refs')?.length > 0) {
          // soft delete
          await updateDoc(docSnap.ref, { removed: true })
            .then(() => {
              label.removed = true;
            });
        } else {
          // hard delete
          await deleteDoc(docSnap.ref)
            .then(() => {
              label.removed = true;
            });
        }
      })
      .catch(error => console.error(error))
  }
  public async editLabel(ref: DocumentReference, data: any) {
    return updateDoc(ref, data)
  }
}
