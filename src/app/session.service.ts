import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { DbService } from './db.service';
import { Label } from './pojos/label';
import { Session } from './pojos/session';
import { WorkEntry } from './pojos/work-entry';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  public labels !: Label[];
  public loading: boolean = true;

  public session!: Session;
  public work_entry!: WorkEntry;
  private _label!: Label;


  constructor(private db: DbService) {
    this.init_session();
  }

  private async init_session() {
    const querySnapshot = await this.db.pullSession();

    querySnapshot.forEach(async (doc) => {
      this.session = doc.data();
      // Pull work entry
      if (this.session.work_entry)
        await this.db.pullWorkEntry(this.session.work_entry)
          .then(async (work_entry) => {
            if (work_entry)
              this.work_entry = work_entry;
            // Pull label
            await this.db.pullLabel(this.work_entry.label)
              .then((label) => {
                if (label)
                  this._label = label;
              })
              .catch(error => {
                console.error(error);
                this.work_entry = new WorkEntry();
                this.session.work_entry = undefined;
              })
          })
          .catch(error => console.error(error))
    });

    // Session not found in DB. Create a new one.
    if (this.session === undefined) {
      this.session = new Session();
    }

    this.loading = false;
  }

  public get label() {
    return this._label;
  }

  public async setLabel(label: Label) {
    this._label = label;
    if (this.session.ref) {
      let querySnapshot = await this.db.findWorkEntry(this.session.ref.path, label.ref);
      querySnapshot.forEach((doc)=>{
        this.work_entry = doc.data();
        return;
      })
    }
    this.work_entry = new WorkEntry();
    this.work_entry.label = label.ref;    
  }

}
