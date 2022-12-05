import { Component, Inject, ɵɵsetComponentScope } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "../auth.service";
import { DbService } from "../db.service";
import { Label } from "../pojos/label";

/**
 * @title Forgot password Dialog.
 */
@Component({
  selector: 'forgot-password',
  templateUrl: './templates/forgot-password.html'
})
export class ForgotPasswordDialog {
  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public emailControl: FormControl,
    private auth: AuthService
  ) { }

  public forgotPassword() {
    if (this.emailControl.valid)
      this.auth.forgotPassword(this.emailControl.value);

  }
}

/**
* @title Create Account Dialog.
*/
@Component({
  selector: 'create-account',
  templateUrl: './templates/create-account.html'
})
export class CreateAccountDialog {
  public hide: boolean;
  constructor(
    public dialogRef: MatDialogRef<ForgotPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public form_group: FormGroup,
    private auth: AuthService
  ) {
    this.hide = true;
  }

  public createAccount() {
    if (this.form_group.valid) {
      this.auth.createAccount(this.form_group.getRawValue());
      this.dialogRef.close();
    }
  }
}

/**
 * @title Edit Label Dialog
 */
@Component({
  selector: 'edit-label',
  templateUrl: './templates/edit-label.html'
})
export class EditLabelDialog {
  public disabled: boolean = false;
  constructor(
    public dialofRef: MatDialogRef<EditLabelDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { label: Label, form_group: FormGroup },
    private db: DbService
  ) {
  }
  public async submit() {
    if (this.form_group.valid) {
      this.form_group.disable();

      if (this.form_group.get('name')?.value !== this.label.name || this.form_group.get('color')?.value !== this.label.color)
        await this.db.editLabel(this.label.ref, this.form_group.getRawValue())
          .then(() => {
            // Update Label with new values.
            this.label.name = this.form_group.get('name')?.value;
            this.label.color = this.form_group.get('color')?.value;
          })
          .catch((error) => console.error(error));
    }

    this.dialofRef.close();
  }

  public get label() {
    return this.data.label;
  }

  public get form_group() {
    return this.data.form_group;
  }
}