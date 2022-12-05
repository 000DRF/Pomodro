import { Component } from '@angular/core';
import { DbService } from '../db.service';
import { Label } from '../pojos/label';
import { SessionService } from '../session.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  private interval: any = undefined;
  constructor(private session_service: SessionService, private settings_service: SettingsService, private db: DbService) {
    window.addEventListener('beforeunload', (event) => {
      this.save();
      event.returnValue = 'Are you sure you want to leave?';
    });
  }

  /**
   * True if session service is doing work.
   */
  public get loading(): boolean {
    return this.session_service.loading;
  }

  /**
   * Gets selected label from session service.
   */
  public get label(): Label {
    return this.session_service.label
  }

  /**
   * Gets current mode from session service.
   */
  public get mode(): 'pom' | 'break' {
    return this.session.mode;
  }

  /**
   * Gets WorkEntry from session service.
   */
  public get workEntry() {
    return this.session_service.work_entry;
  }

  /**
   * Handles pause event.
   * @param pauseBtn 
   */
  public pause(pauseBtn: boolean = false) {
    if (this.settings.sound && pauseBtn)
      new Audio('../assets/sounds/pause.wav').play();
    clearInterval(this.interval);
    this.interval = undefined;
  }

  /**
   * True if timer is paused. 
   */
  public get isPaused(): boolean {
    return this.interval === undefined;
  }

  /**
   * Handles the start timer event.
   * Plays sound if called by pause button.
   * @param pauseBtn If function was called by pauseBtn.
   */
  public start(pauseBtn: boolean = false) {
    if (this.settings.sound && pauseBtn)
      new Audio('../assets/sounds/start.wav').play();

    this.interval = setInterval(() => {
      this.display.decrement();
      if (this.mode === 'pom' && this.workEntry)
        this.workEntry.workTime++;

      if ((this.target.secs - this.display.secs) % 60 === 0)
        this.save()

      if (this.display.end)
        this.handleEnd();

    }, 1000)
  }
  /**
   * Handles event when timer runs out of time.
   */
  private handleEnd() {
    this.pause();
    this.notify();
    this.endSound();
    if (this.mode === 'pom') {
      this.session.poms++;

      let added_break: number = 0;
      if ((this.session.poms % this.settings.cost) === 0) // Long break
        added_break = (this.settings.break * 60)
      else
        added_break = (this.settings.short_break * 60) // Short break

      this.session.break.target.secs += added_break;
      this.session.break.display.secs += added_break;

      if (this.settings.auto_break)
        this.startBreak();
    }
    else { // Break time has run out
      this.session.break.target.secs = 0;
      this.session.break.display.secs = 0;
      if (this.settings.auto_pom)
        this.startWork();
    }
  }

  /**
   * Gets session Object from session service. 
   */
  public get session() {
    return this.session_service.session;
  }

  /**
   * Gets settings object form settings service.
   */
  public get settings() {
    return this.settings_service.settings;
  }

  /**
   * gets display Time from session, based on current mode.
   */
  public get display() {
    return this.session[this.mode].display
  }

  /**
   * Gets target Time from session, based on current mode.
   */
  public get target() {
    return this.session[this.mode].target
  }

  /**
   * Starts Pomodoro timer.
   */
  public startWork() {
    if (this.settings.sound)
      new Audio('../assets/sounds/start_pom.wav').play();

    if (this.validPom) {
      this.session.mode = 'pom';
      if (!this.display.secs) {
        this.session.pom.target.secs = this.settings.pom * 60;
        this.session.pom.display.secs = this.settings.pom * 60;
      }
      this.start();
    }
  }

  /**
   * Starts Break timer. 
   */
  public startBreak() {
    if (this.settings.sound)
      new Audio('../assets/sounds/start_break.wav').play();

    if (this.validBreak) {
      this.session.mode = 'break';
      this.start();
    }
  }

  /**
   * Feeds progress to mat-progress-bar component .
   */
  public get progress() {
    let progress = this.target.secs - this.display.secs;
    return (progress / this.target.secs) * 100
  }

  /**
   * True if break should be an option.
   */
  public get validBreak(): boolean {
    return (this.session.break.target.secs > 0) && this.mode == 'pom' && this.isPaused;
  }

  /**
   * True if pomodoro should be an option.
   */
  public get validPom(): boolean {
    return this.isPaused && (!this.display.secs || this.mode === 'break')
  }

  /**
   * Saves progress by calling save() form session service. 
   */
  private async save() {
    await this.session_service.save()

  }

  get validWorkEntry() {
    return this.session_service.validWorkEntry;
  }

  /**
   * Prompts user to change label by making work entry invalid.
   */
  public async changeLabel() {
    if (this.isPaused) {
      if (this.workEntry && this.workEntry.workTime > 0)
        await this.save();
      this.session_service.work_entry = undefined;
    }
  }

  /**
   * Plays end of timer sound. 
   */
  private endSound() {
    if (this.settings.sound) {
      let alarm = new Audio('../assets/sounds/end.wav');
      alarm.play()
      let i = 1;
      alarm.onended = () => {
        if (i < 3) {
          alarm.play();
          i++;
        }
      }
    }
  }


  /**
   * src: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
   */
  private notify() {
    if (this.settings.notifications) {
      let msg = this.mode === 'pom' ? `You've finished Pomodoro #${this.session.poms + 1}!` : 'Your break is up!';
      let img = '../assets/img/pomodoro.png';
      if (!("Notification" in window)) {
        // Check if the browser supports notifications
        alert("This browser does not support desktop notification");
      } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
        const notification = new Notification('Pomodoro', { body: msg, icon: img });
        // …

      } else {
        // We need to ask the user for permission
        Notification.requestPermission().then((permission) => {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            const notification = new Notification('Pomodoro', { body: msg, icon: img });

            // …
          }
        });
      }
    }
  }

}