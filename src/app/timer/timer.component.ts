import { Component } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent {

  constructor(private session: SessionService) {

  }

  get loading(): boolean {
    return this.session.loading;
  }

  get labelSelected(): boolean {
    return this.session.labelSelected;
  }
}