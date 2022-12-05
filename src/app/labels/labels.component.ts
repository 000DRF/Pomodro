import { Component } from '@angular/core';
import { ENTER } from '@angular/cdk/keycodes';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DbService } from '../db.service';
import { EditLabelDialog } from '../dialogs/dialogs.components';
import { Label } from '../pojos/label';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss']
})
export class LabelsComponent {
  readonly separatorKeysCodes = [ENTER]; // pressing enter submits this.form_group
  public label_control: FormControl;
  public edit: boolean; // Prompts user to select label 
  public form_group: FormGroup;
  constructor(private db: DbService, private session: SessionService, public dialog: MatDialog) {
    this.form_group = new FormGroup({
      name: new FormControl('', [Validators.required, this.validate_name]),
      color: new FormControl(this.randomColor, Validators.required)
    })

    this.edit = this.labels.length === 0;
    this.label_control = new FormControl(this.session.label, [Validators.required, this.validate_label]);
  }


  private validate_name(control: FormControl) {
    const value = (control.value || '').trim();
    if (value)
      return value.length > 24 ? { 'valid_name': true } : null;

    return { 'validate_name': true };
  }

  private validate_label(control: FormControl) {
    return (control.value instanceof Label) ? null : { 'unselected': true };
  }

  /**
   * Initializes form with random color.
   * @src https://css-tricks.com/snippets/javascript/random-hex-color/
   * @return random hex color
   */
  private get randomColor() {

    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  /**
   * Adds new label to DB.
   */
  public async add() {
    if (this.form_group.valid) {
      this.form_group.disable();
      let label = new Label(this.form_group.get('color')?.value, this.form_group.get('name')?.value);
      await this.db.pushLabel(label)
        .then((docRef) => {
          label.ref = docRef;
          this.labels.splice(this.getInsertIndex(label.name), 0, label)
        })
        .catch(error => console.error(error))

      this.form_group.enable();
    }
    this.form_group.reset();
    this.form_group.get('color')?.setValue(this.randomColor);
  }

  /**
   * Removes label provided from list & DB.
   * @param label 
   */
  public async remove(label: Label) {
    this.form_group.disable();
    await this.db.rmLabel(label);
    if (label.removed) {
      const index = this.labels.indexOf(label);
      this.labels.splice(index, 1);
    }
    this.form_group.enable();
  }

  /**
   * Returns index of list where new label is to be inserted.
   * @param name of Label to be inserted
   * @returns 
   */
  private getInsertIndex(name: string): number {
    let start = 0;
    let finish = this.labels.length - 1;

    while (start <= finish) {
      let mid = (start + finish) >> 1;

      if (this.labels[mid].name < name) {
        start = mid + 1;
      } else {
        finish = mid - 1;
      }
    }

    return start;
  }
  
  /**
   * Opens dialog prompting user to update selected label.
   * @param label 
   */
  public editLabel(label: Label) {
    const dialogRef = this.dialog.open(EditLabelDialog, {
      data: {
        label: label,
        form_group: new FormGroup({
          name: new FormControl(label.name, [Validators.required, this.validate_name]),
          color: new FormControl(label.color, Validators.required)
        })
      },
      disableClose: true
    })

    dialogRef.afterClosed().subscribe(() => {
      const index = this.labels.indexOf(label);
      this.labels.splice(index, 1);
      this.labels.splice(this.getInsertIndex(label.name), 0, label)
    })

  }

  /**
   * Label is selected and added to session.
   */
  public selectLabel() {
    if (this.label_control.valid)
      this.session.setLabel(this.label_control.value);
  }
  
  /**
   * Retrieves list of labels from session service.
   */
  public get labels(): Label[] {
    return this.session.labels
  }

  /**
   * Edits list of labels from session service. 
   */
  public set labels(labels: Label[]) {
    this.session.labels = labels;
  }
}
