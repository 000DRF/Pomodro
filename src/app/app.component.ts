import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Settings } from './pojos/settings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Pomodoro';
  settings!: Settings

  constructor(private auth: AuthService) {
  }

  public get userLoaded() {
    return this.auth.userType !== 'undefined';
  }

  public get signedIn() {
    return this.auth.userType === 'object';
  }
}
