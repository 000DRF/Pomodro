import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
