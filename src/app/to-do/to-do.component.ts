import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatCheckbox, MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DbService } from '../db.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.scss'],
  providers: [{ provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' } }]
})
export class ToDoComponent {
  private _show_input: boolean = false;
  public pushing: boolean = false;

  constructor(private session_service: SessionService, private db: DbService, private _snackBar: MatSnackBar) { }

  get tasks() {
    return this.session_service.label.todo.tasks;
  }

  set tasks(val: string[]) {
    this.session_service.label.todo.tasks = val;
  }

  get completed() {
    return this.session_service.label.todo.completed;
  }
  
  set completed(val: string[]) {
    this.session_service.label.todo.completed = val;

  }

  get validWorkEntry(): boolean {
    return this.session_service.validWorkEntry;
  }

  get showInput(): boolean {
    return this._show_input
  }

  private get label() {
    return this.session_service.label.ref;
  }

  set showInput(val: boolean) {
    this._show_input = val;
  }
  /**
   * Adds task to DB, then tasks list.  
   * @param input 
   */
  async addTask(input: string) {
    const name = (input || '').trim();
    if (this.validName(name)) {
      this.pushing = true;
      await this.db.addTask(this.label, name)
        .then(() => {
          this.tasks.push(name);
        })
      this.pushing = false
    }
  }

  /**
   * Moves task from: tasks -> completed (or) completed -> task
   * @param i index
   * @param check_box checkbox clicked
   */
  async change(i: number, check_box: MatCheckbox) {
    this.pushing = true;
    if (check_box.checked) { // completed -> tasks 
      // check_box.toggle();
      await this.db.moveTask(this.label, check_box.value, 'completed')
        .then(() => {
          this.tasks.push(check_box.value);
          this.completed.splice(i, 1);
        })
        .catch(error => {
          console.error(error)
          check_box.setDisabledState(false)
        });
    } else { // tasks -> completed
      // check_box.toggle();
      await this.db.moveTask(this.label, check_box.value, 'tasks')
        .then(() => {
          this.completed.push(check_box.value.slice());
          this.tasks.splice(i, 1);
        })
        .catch(error => {
          console.error(error)
          check_box.setDisabledState(false)
        });
    }
    this.pushing = false;
  }
  /**
   * Removes task from appropriate list and DB.
   * @param i index
   * @param checked 
   */
  async remove(i: number, checked: boolean) {
    this.pushing = true;
    if (checked) {
      await this.db.rmTask(this.label, this.completed[i], 'completed')
        .then(() => {
          this.completed.splice(i, 1);
        });
    } else {
      await this.db.rmTask(this.label, this.tasks[i], 'tasks')
        .then(() => {
          this.tasks.splice(i, 1);
        });
    }
    this.pushing = false;
  }

  /**
   * Validates task entry by ensuring correct length & uniqueness.
   * @param name task to be added
   * @returns 
   */
  private validName(name: string): boolean {
    if (name) {
      if (name.length <= 24)
        if (!(this.completed.includes(name)) && !(this.tasks.includes(name)))
          return true
        else
          this._snackBar.open(`Task '${name}' already exists.`, '', { duration: 1000 * 3 })
    }
    return false;
  }
}
