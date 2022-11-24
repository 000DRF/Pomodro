import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DbService } from './db.service';
import { Settings } from './pojos/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public updating: boolean = false;
  public loading: boolean = true;

  public form_group!: FormGroup;
  private settings!: Settings;
  constructor(private db: DbService) {
    this.initSettings()
  }

  /**
   * Initializes objects needed to initialize other components.
   */
  private async initSettings() {
    const doc = await this.db.pullSettings();
    this.settings = Settings.converter(doc);
    this.initFormGroup();
  }

  private initFormGroup() {
    let time_validators = [Validators.required, Validators.min(1), Validators.max(60)]

    this.form_group = new FormGroup({
      pom: new FormControl(this.settings.pom, time_validators),
      break: new FormControl(this.settings.break, time_validators),
      short_break: new FormControl(this.settings.short_break, time_validators),
      cost: new FormControl(this.settings.cost, [Validators.required, Validators.max(10), Validators.min(1)]),
      auto_pom: new FormControl(this.settings.auto_pom, Validators.required),
      auto_break: new FormControl(this.settings.auto_break, Validators.required),
      sound: new FormControl(this.settings.sound, Validators.required),
      notifications: new FormControl(this.settings.notifications, Validators.required),
      dark_mode: new FormControl(this.settings.dark_mode, Validators.required)
    });
    this.loading = false;
  }

  public async save() {
    if (this.valid()) {
      this.updating = true;
      this.form_group.disable();
      console.log('pushing changes..')

      await this.db.pushSettings(this.form_group.getRawValue())
        .then(() => {
          this.settings.pom = this.form_group.get('pom')?.value;
          this.settings.break = this.form_group.get('break')?.value;
          this.settings.short_break = this.form_group.get('short_break')?.value;
          this.settings.cost = this.form_group.get('cost')?.value;
          this.settings.auto_pom = this.form_group.get('auto_pom')?.value;
          this.settings.auto_break = this.form_group.get('auto_break')?.value;
          this.settings.sound = this.form_group.get('sound')?.value;
          this.settings.notifications = this.form_group.get('notifications')?.value;
          this.settings.dark_mode = this.form_group.get('dark_mode')?.value;
        })
        .catch(error => {
          console.error(error);
        });

        this.updating = false;
        this.form_group.enable();        
    } else {
      console.log('0 changes..')
    }
  }

  private valid() {
    if (this.form_group.valid) {
      let key: keyof typeof this.settings;

      for (key in this.settings) {
        let field = this.settings[key];

        if (this.form_group.get(key)?.value !== field)
          return true;
      }
    }
    return false;
  }
}
