import { Injectable } from '@angular/core';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private auth: AuthService, private db: Firestore) { }

  public async pullSettings() {
    const ref = doc(this.db, this.auth.user_path);
    return await getDoc(ref);
  }

  public async pushSettings(settings: any) {
    const ref = doc(this.db, this.auth.user_path)    
    return setDoc(ref, {settings: settings}, {merge: true})
    
  }
}
