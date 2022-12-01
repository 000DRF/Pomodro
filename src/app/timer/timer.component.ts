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

  public get loading(): boolean {
    return this.session_service.loading;
  }

  public get label(): Label {
    return this.session_service.label
  }

  public get mode(): 'pom' | 'break' {
    return this.session.mode;
  }

  public get workEntry() {
    return this.session_service.work_entry;
  }

  public get labelSelected(): boolean {
    return (this.session_service.label !== undefined)
  }

  public pause(pauseBtn: boolean = false) {
    if (this.settings.sound && pauseBtn)
      new Audio('../assets/sounds/pause.wav').play();
    clearInterval(this.interval);
    this.interval = undefined;
  }

  public get isPaused(): boolean {
    return this.interval === undefined;
  }

  public start(pauseBtn: boolean = false) {
    if (this.settings.sound && pauseBtn)
      new Audio('../assets/sounds/start.wav').play();

    this.interval = setInterval(() => {
      this.display.decrement();
      if (this.mode === 'pom' && this.workEntry)
        this.workEntry.workTime++;

      if ((this.target.time - this.display.time) % 60 === 0)
        this.save()

      if (this.display.end) {
        this.handleEnd();
      }

    }, 1000)
  }

  public get session() {
    return this.session_service.session;
  }

  public get settings() {
    return this.settings_service.settings;
  }

  public get display() {
    return this.session[this.mode].display
  }

  public get target() {
    return this.session[this.mode].target
  }

  public startWork() {
    if (this.settings.sound)
      new Audio('../assets/sounds/start_pom.wav').play();

    if (this.validPom) {
      this.session.mode = 'pom';
      if (!this.display.time) {
        this.session.pom.target.time = this.settings.pom * 60;
        this.session.pom.display.time = this.settings.pom * 60;
      }
      this.start();
    }
  }

  public startBreak() {
    if (this.settings.sound)
      new Audio('../assets/sounds/start_break.wav').play();

    if (this.validBreak) {
      this.session.mode = 'break';
      this.start();
    }
  }

  public get progress() {
    let progress = this.target.time - this.display.time;
    return (progress / this.target.time) * 100
  }

  public get validBreak(): boolean {
    return (this.session.break.target.time > 0) && this.mode == 'pom' && this.isPaused;
  }

  public get validPom(): boolean {
    return this.isPaused && (!this.display.time || this.mode === 'break')
  }

  private async save() {
    if (this.session && this.session_service.work_entry)
      await this.db.pushProgress(this.session, this.session_service.work_entry)

  }
  
  get validWorkEntry() {
    if (this.workEntry)
      if (this.label)
        return this.label.ref.id === this.workEntry.label.id;
    return false;
  }

  public changeLabel() {
    if (this.isPaused) {
      this.save();
      this.session_service.work_entry = undefined;
    }
  }

  private handleEnd() {
    this.pause();
    this.endSound();
    if (this.mode === 'pom') {
      this.session.poms++;
      let added_break: number = 0;
      if ((this.session.poms % this.settings.cost) === 0)
        added_break = (this.settings.break * 60)
      else
        added_break = (this.settings.short_break * 60)
      this.session.break.target.time += added_break;
      this.session.break.display.time += added_break

      if (this.settings.auto_break)
        this.startBreak();
    }
    else {
      this.session.break.target.time = 0;
      this.session.break.display.time = 0;
      if (this.settings.auto_pom)
        this.startWork();
    }
  }


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

}