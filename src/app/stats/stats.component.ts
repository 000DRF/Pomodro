import { Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import Chart from 'chart.js/auto'

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
  @ViewChild('chart') private canvas: any;
  private context: any;
  private chart !: any;


  public range = false;
  public queryType: 'day' | 'range' | 'label' = 'day';
  public loading: boolean = false;
  public data: Data = {}

  public dayControl = new FormControl(null, Validators.required)
  public startControl = new FormControl(null, Validators.required)
  public endControl = new FormControl(null, Validators.required)

  constructor(private session_service: SessionService, private db: DbService) { }

  public get labels(): Label[] {
    return this.session_service.labels;
  }
  private get validForm(): boolean {
    if (this.queryType === 'range')
      return this.startControl.valid && this.endControl.valid;
    else if (this.queryType === 'day')
      return this.dayControl.valid
    else
      return false /* Label control*/
  }
  public async view() {
    if (this.validForm) {
      this.session_service.save();
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
      console.log('db function returned', this.data)
      this.loading = false;
      this.displayChart();
    }

  }

  private displayChart() {
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

    if (this.chart)
      this.chart.destroy();
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

  private get labelNames(): string[] {
    let labels: string[] = [];
    Object.keys(this.data).forEach(key => {
      labels.push(this.data[key].label.name);
    });
    return labels
  }

  private get labelColors(): string[] {
    let colors: string[] = [];
    Object.keys(this.data).forEach(key => {
      colors.push(this.data[key].label.color)
    })
    return colors;
  }

  private get times(): Time[] {
    let times: Time[] = []
    Object.keys(this.data).forEach(key => {
      times.push(this.data[key].time)
    });
    return times;
  }
}
