import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  constructor(private settings: SettingsService, private auth: AuthService) { }

  /**
   * src: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
   */
  public notify() {
    let img = '../assets/img/pomodoro.png';
    let msg = 'Notifications enabled!'
    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      const notification = new Notification('Pomodoro', { body: msg, icon: img });
      this.formGroup.get('notifications')?.setValue(true);
      return;
      // …

    } else {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification('Pomodoro', { body: msg, icon: img });
          this.formGroup.get('notifications')?.setValue(true);

          // …
          return;
        }
      });
    }

  }

  /**
   * Retrieves loading variable from settings service.
   */
  public get loading(): boolean {
    return this.settings.loading;
  }
  /**
   * Retrieves form group from settings service.
   */
  public get formGroup(): FormGroup {
    return this.settings.form_group;
  }
  /**
   * Formats label for mat-slider
   * @param value 
   * @returns 
   */
  public formatLabel(value: number) {
    if (value < 60) {
      return value + 'm';
    }

    return '1hr';
  }
  /**
   * Saves settings to DB and notifies user if notifications were enabled. 
   */
  public save() {
    if (!this.settings.settings.notifications && this.formGroup.get('notifications')?.value)
      this.notify()
    this.settings.save();
  }

  public get updating() {
    return this.settings.updating
  }

  public get isAnonymous(): boolean {
    return this.auth.isAnonymous
  }

  /**
   *  Signs the user out by calling method in auth service.
   */
  public signOut() {
    this.auth.signOut();
  }
}
