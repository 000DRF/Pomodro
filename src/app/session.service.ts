import { Injectable } from '@angular/core';
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
  public work_entry!: WorkEntry | undefined;
  private _label!: Label;


  constructor(private db: DbService) {
    this.init_session();
  }

  private async init_session() {
    const querySnapshot = await this.db.pullSession();

    for (const doc of querySnapshot.docs) {
      this.session = doc.data();
      if (this.session.work_entry) {
        let work_entry = await this.db.pullWorkEntry(this.session.work_entry)

        if (work_entry.time.secs > 0) {
          // Pull label
          let label = await this.db.pullLabel(work_entry.label)
          if (label) {
            this._label = label;
            this.work_entry = work_entry;
          }
          else {
            this.work_entry = new WorkEntry();
            this.session.work_entry = undefined;
          }
        }
      }
    }
    // Session not found in DB. Create a new one.
    if (this.session === undefined)
      this.session = new Session();

    //pull labels
    this.labels = await this.db.pullLabels();

    this.loading = false;
  }

  public get label() {
    return this._label;
  }

  public async setLabel(label: Label) {
    this._label = label;
    if (this.session.ref) {
      let querySnapshot = await this.db.findWorkEntry(this.session.ref.path, label.ref);
      querySnapshot.forEach((doc) => {
        this.work_entry = doc.data();
      })
    }
    if (!this.work_entry) {
      this.work_entry = new WorkEntry();
      this.work_entry.label = label.ref;
    }
  }

  public async save() {
    if (this.session && this.work_entry)
      await this.db.pushProgress(this.session, this.work_entry)
  }
}
