import { Injectable } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInAnonymously, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { sendPasswordResetEmail } from '@firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user!: null | User;
  private auth_errors: { [key: string]: string } = {
    'auth/email-already-exists': 'The email provided is already in use.',
    'auth/internal-error': 'An internal error has occurred.',
    'auth/invalid-email': 'The email provided is invalid.',
    'auth/invalid-password': 'Incorrect password.',
    'auth/user-not-found': 'There is no account associated with this email.'
  }
  constructor(private auth: Auth, private _snackBar: MatSnackBar) {
    onAuthStateChanged(auth, user => {
      this.user = user;
    });
  }

  public get user_path() {
    return this.user ? 'users/' + this.user.uid : "";
  }

  public get isAnonymous():boolean{
    return this.user? this.user.isAnonymous: true;
  }

  public signOut(){
    this.auth.signOut();
  }

  /**
   * User is signed in anonymously.
   */
  public anonymousSignIn() {
    signInAnonymously(this.auth)
      .catch(error => console.error(error));
  }

  /**
   * Creates user with email and password. 
   * @param {{email: string, password: string}} fields 
   */
  public async createAccount(fields: { email: string, password: string }) {
    await createUserWithEmailAndPassword(this.auth, fields.email, fields.password)
      .then(async (userCredential) => {
        this.verifyEmail(userCredential.user);
      })
      .catch((error) => {
        this.snackMsg(error)
      })
  }

  /**
   * User data type.
   * @return User | undefined | null
   */
  public get userType(): string {
    if (this.user === null)
      return 'null';
    return typeof this.user;
  }

  /**
   * Sends account verification email to user. 
   * @param user 
   */
  public async verifyEmail(user: User) {
    await sendEmailVerification(user)
      .then(() => {
        this.snackMsg(`Email sent to ${user.email}. Please verify email address.`)
      })
      .catch(error => this.snackMsg(error));
  }

  /**
   * Signs in user with email and password.
   * @param {{email: string, password: string}} fields
   */
  public signIn(fields: { email: string, password: string }) {
    signInWithEmailAndPassword(this.auth, fields.email, fields.password)
      .catch((error) => this.snackMsg(error));
  }

  /**
   * Loin with Google account.
   */
  public googleSignIn() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .catch(error => {
        this.snackMsg(error);
      });
  }

  /**
   * Email is sent to change password.
   */
  public forgotPassword(email: string) {
    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        this.snackMsg(`An email has ben sent to ${email}.`)
      })
      .catch(error => {
        this.snackMsg(error)
      })
  }

  /**
   * Opens snack message.
   * @param data String or error caught,
   */
  private snackMsg(data: any = undefined) {
    let msg: string = 'An error has ocurred.';
    let action: string | undefined;
    let option: { duration: number } | undefined;
    if (typeof data === 'string') {
      msg = data;
      action = 'close';
    }
    else if (typeof data === 'object') {
      console.error(data)
      const code: string = data.code;
      const description = this.auth_errors[code];
      if (description)
        msg = description;
      option = { duration: 1000 * 3 /* 3 seconds */ }
    }
    this._snackBar.open(msg, action, option);
  }
}
