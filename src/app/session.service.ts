import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { DbService } from './db.service';
import { Label } from './pojos/label';
import { Session } from './pojos/session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  public labels !: Label[];
  public new_session: boolean = false;
  public loading: boolean = true;

  public session!: Session

  constructor(private db: DbService) {
    this.init_session();
  }

  private async init_session() {
    const querySnapshot = await this.db.pullSession();

    querySnapshot.forEach(async (doc) => {
      this.session = doc.data();
      // Pull label
      if (this.session.label instanceof DocumentReference) {
        await this.db.pullLabel(this.session.label)
          .then((label) => {
            this.session.label = label;
          })
          .catch(error => {
            console.log(error)
          })
      }
      this.new_session = false;
    });

    // Session not found in DB. Create a new one.
    if (this.session === undefined) {
      this.new_session = true;
      this.session = new Session();
    }

    this.loading = false;
  }

  public get labelSelected(): boolean {
    return this.session.label instanceof Label;
  }

  public set label(label: any) {
    if (!(label instanceof Label))
      this.session.label = undefined;
    else
      this.session.label = label
  }

  public get label(): Label | null {
    return (this.session.label instanceof Label)? this.session.label : null;
  }
}
