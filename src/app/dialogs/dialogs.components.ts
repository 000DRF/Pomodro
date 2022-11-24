import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AuthService } from "../auth.service";

/**
 * @title Forgot password Dialog.
 */
@Component({
  selector: 'forgot-password',
  templateUrl: './templates/forgot-password.html',
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
  templateUrl: './templates/create-account.html',
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
    if (this.form_group.valid){
      this.auth.createAccount(this.form_group.getRawValue());
      this.dialogRef.close();
    }

  }
}