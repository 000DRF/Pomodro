import { style } from '@angular/animations';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { CreateAccountDialog, ForgotPasswordDialog } from '../dialogs/dialogs.components';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  private emailValidators: ValidatorFn[];
  private passwordValidators: ValidatorFn[];

  public form_group: FormGroup;
  public hide: boolean;
  constructor(private auth: AuthService, public dialog: MatDialog) {
    this.emailValidators = [Validators.required, Validators.email];
    this.passwordValidators = [Validators.required, Validators.minLength(6)]
    this.form_group = new FormGroup({
      email: new FormControl(null, this.emailValidators),
      password: new FormControl(null, this.passwordValidators)
    });

    this.hide = true;
  }

  /**
   * Opens 'CreateAccountDialog' component.
   */
  public createAccount() {
    let prefill = this.form_group.controls['email'].value;

    this.dialog.open(CreateAccountDialog, {
      data: new FormGroup({
        email: new FormControl(prefill, this.emailValidators),
        password: new FormControl(null, this.passwordValidators)
      })
    })
  }

  /**
   * Opens 'ForgotPasswordDialog' component.
   */
  public forgotPassword() {
    let prefill = this.form_group.controls['email'].value
    this.dialog.open(ForgotPasswordDialog, {
      data: new FormControl(prefill, this.emailValidators),
    })
  }
  /**
   * Calls AuthService.signIn().
   */
  public signIn() {
    if (this.form_group.valid)
      this.auth.signIn(this.form_group.getRawValue())
  }

  /**
   * Calls AuthService.anonymousSignIn().
   */
  public anonymousSignIn() {
    this.auth.anonymousSignIn();
  }

  /**
   * Calls AuthService.googleSignIn().
   */
  public googleSignIn() {
    this.auth.googleSignIn();
  }
}
