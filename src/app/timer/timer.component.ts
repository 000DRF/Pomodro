import { Component } from '@angular/core';
import { Label } from '../pojos/label';
import { Time } from '../pojos/time';
import { WorkEntry } from '../pojos/work-entry';
import { SessionService } from '../session.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {
  private interval: any = undefined;
  constructor(private session_service: SessionService, private settings_service: SettingsService) {
  }

  public get loading(): boolean {
    return this.session_service.loading;
  }

  public get label(): Label {
    return this.session_service.label
  }

  public get labelSelected(): boolean {
    return this.session_service.label !== undefined;
  }

  public pause() {
    clearInterval(this.interval);
    this.interval = undefined;
  }

  public get isPaused(): boolean {
    return this.interval === undefined;
  }

  public start() {
    this.interval = setInterval(() => {
      this.display.decrement();
      this.session_service.work_entry.workTime++;
      if (this.display.end) {
        this.pause();
        if (this.session.mode === 'pom') {
          this.session.poms++;
          let added_break: number = 0;
          if ((this.session.poms % this.settings.cost) === 0)
            added_break = (this.settings.break * 60)
          else
            added_break = (this.settings.short_break * 60)
          this.session.break.target.time += added_break;
          this.session.break.display.time += added_break
        }
        else {
          this.session.break.target.time = 0;
          this.session.break.display.time = 0;
        }
      }
    }, 100)
  }

  public get session() {
    return this.session_service.session;
  }

  public get settings() {
    return this.settings_service.settings;
  }

  public get display() {
    return this.session[this.session.mode].display
  }

  public get target() {
    return this.session[this.session.mode].target
  }

  public startWork() {
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
    return (this.session.break.target.time > 0) && this.session.mode == 'pom' && this.isPaused;
  }

  public get validPom(): boolean {
    return this.isPaused && (!this.display.time || this.session.mode === 'break')
  }

}