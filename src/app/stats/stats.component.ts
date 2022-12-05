import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Chart } from 'chart.js/auto';

import { DbService } from '../db.service';
import { Label } from '../pojos/label';
import { Time } from '../pojos/time';
import { SessionService } from '../session.service';

export interface Data {
  [key: string]: { label: Label, time: Time }
}


@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent {
  @ViewChild('chartCanvas') private canvas: any;
  public chart !: any;


  public range = false;
  public queryType: 'day' | 'range' = 'day';
  public loading: boolean = false;
  public data: Data = {}

  public dayControl = new FormControl(null, Validators.required)
  public startControl = new FormControl(null, Validators.required)
  public endControl = new FormControl(null, Validators.required)

  constructor(private session_service: SessionService, private db: DbService) {

  }

  /**
   * Gets labels from session service. 
   */
  public get labels(): Label[] {
    return this.session_service.labels;
  }

  /**
   * Validates from based on button toggle. 
   */
  private get validForm(): boolean {
    if (this.queryType === 'range')
      return this.startControl.valid && this.endControl.valid;
    else
      return this.dayControl.valid

  }

  /**
   * Queries DB for data , then calls displayChart();
   */
  public async view() {
    if (this.validForm) {
      await this.session_service.save();
      this.loading = true;
      let startDate: Date = new Date();
      let endDate: Date = new Date();

      if (this.queryType === 'day') {
        if (this.dayControl.value) {
          startDate = this.dayControl.value;
          endDate = new Date(startDate);
        }
      } else /*if (this.queryType === 'range')*/ {
        if (this.startControl.value && this.endControl.value) {
          startDate = this.startControl.value;
          endDate = this.endControl.value;
        }
      }
      this.data = await (this.db.pullData(startDate, endDate));
      this.loading = false;
      if (Object.keys(this.data).length > 0)
        this.displayChart();
    }
  }

  /**
   * Displays pie chart if data exists.
   */
  private displayChart() {
    if (this.chart)
      this.chart.destroy();
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    const data = {
      labels: this.labelNames,
      datasets: [{
        label: 'Total Pomodoro Time',
        data: this.times,
        backgroundColor: this.labelColors,
        hoverOffset: 4
      }]
    };

    this.chart = new Chart(context, {
      type: 'pie',
      data: data,
      options: {
        parsing: {
          key: 'secs'
        },
        plugins: {
          legend: {
            labels: {
              font: { size: 14 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                return '\t' + context.raw.toString();
              }
            }
          }
        },
        layout: {
          padding: 20
        },
        responsive: true,
      }
    }
    )
  }

  /**
   * Returns list of label names for chart.js
   */
  private get labelNames(): string[] {
    let labels: string[] = [];
    Object.keys(this.data).forEach(key => {
      labels.push(this.data[key].label.name);
    });
    return labels
  }

  /**
   * returns list of colors for chart.js
   */
  private get labelColors(): string[] {
    let colors: string[] = [];
    Object.keys(this.data).forEach(key => {
      colors.push(this.data[key].label.color)
    })
    return colors;
  }

  /**
   * Returns list of Time objects for time.js
   */
  private get times(): Time[] {
    let times: Time[] = []
    Object.keys(this.data).forEach(key => {
      times.push(this.data[key].time)
    });
    return times;
  }
}
