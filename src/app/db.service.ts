import { Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, docSnapshots, DocumentReference, Firestore, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { deleteDoc } from '@firebase/firestore';
import { AuthService } from './auth.service';
import { Label } from './pojos/label';
import { Session } from './pojos/session';
import { WorkEntry } from './pojos/work-entry';
import { Data } from './stats/stats.component';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private auth: AuthService, private db: Firestore) { }

  public pullSession() {
    const sod = new Date();
    const eod = new Date();

    this.setTime(sod, eod);

    const sessionsRef = collection(this.db, this.auth.user_path + '/sessions');
    const q = query(sessionsRef, where('time_stamp', '>=', sod), where('time_stamp', '<=', eod)).withConverter(Session.converter)

    return getDocs(q);
  }

  private setTime(start: Date, end: Date) {
    // start of day
    start.setHours(0);
    start.setMinutes(0);
    start.setSeconds(0);
    // end of day
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
  }

  public async pullData(sod: Date, eod: Date) {
    let data :Data = {};
    this.setTime(sod, eod);

    const sessionsRef = collection(this.db, this.auth.user_path + '/sessions');
    const q = query(sessionsRef, where('time_stamp', '>=', sod), where('time_stamp', '<=', eod))
    const sessionDocs = await getDocs(q);

    for (const sessionSnap of sessionDocs.docs) {
      const workEntriesRef = collection(this.db, sessionSnap.ref.path + '/work')
      const workDocs = await getDocs(workEntriesRef.withConverter(WorkEntry.converter))

      for (const workSnap of workDocs.docs) {
        const work = workSnap.data();
        const labelRef = work.label;

        if (labelRef.id in data) {
          data[labelRef.id].time.secs += work.time.secs;
        } else {

          const doc = await getDoc(work.label.withConverter(Label.converter))
          const label = doc.data();

          if (label){
            console.log({ label: label, time: work.time })
            data[label.ref.id] = { label: label, time: work.time }
          }
        }
      }
    }
    return data;
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

  public async findWorkEntry(path: string, label_ref: DocumentReference) {
    console.log('looking for ref')
    const workEntries = collection(this.db, path + '/work')
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

  public async pushProgress(session: Session, work_entry: WorkEntry) {
    const getRef = () => {
      return doc(collection(this.db, this.auth.user_path + '/sessions'))
    }
    const session_ref = session.ref ? session.ref : getRef();

    if (work_entry.ref) {
      console.log('updating work entry...')
      await updateDoc(work_entry.ref, WorkEntry.update(work_entry))
        .catch(error => console.error(error));
    } else {
      console.log('pushing work entry..')
      await addDoc(collection(this.db, session_ref.path + '/work').withConverter(WorkEntry.converter), work_entry)
        .then(async (docRef) => {
          session.work_entry = docRef
          work_entry.ref = docRef
          await updateDoc(work_entry.label, {
            refs: arrayUnion(docRef)
          })
            .catch(error => console.error(error));
        })
        .catch(error => console.error(error));
    }

    if (session.ref) {
      console.log('updating session...')
      await updateDoc(session_ref, Session.update(session))
        .catch(error => console.error(error));
    } else {
      console.log('pushing session..')
      await setDoc(session_ref.withConverter(Session.converter), session)
        .then(() => {
          session.ref = session_ref;
        })
        .catch(error => console.error(error));
    }

  }
}
