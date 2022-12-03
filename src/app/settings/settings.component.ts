import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  constructor(private settings: SettingsService) {

  }

  ngOnInit(): void {
  }
  
  /**
   * src: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
   */
  public notify(status: MatSlideToggleChange) {
    if(status.checked){
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
    this.formGroup.get('notifications')?.setValue(false);
  }
  

  public get loading(): boolean {
    return this.settings.loading;
  }

  public get formGroup(): FormGroup {
    return this.settings.form_group;
  }

  public formatLabel(value: number) {
    if (value < 60) {
      return value + 'm';
    }

    return '1hr';
  }

  public save(){
    this.settings.save();
  }

  public get updating(){
    return this.settings.updating
  }
}
