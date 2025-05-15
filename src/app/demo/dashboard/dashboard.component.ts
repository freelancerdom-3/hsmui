/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, LinearScale, CategoryScale, BarController, BarElement, Tooltip, Legend } from 'chart.js';

Chart.register(...registerables); // or manually register only the required ones:
Chart.register(LinearScale, CategoryScale, BarController, BarElement, Tooltip, Legend);


// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

declare const AmCharts;

import '../../../assets/charts/amchart/amcharts.js';
import '../../../assets/charts/amchart/gauge.js';
import '../../../assets/charts/amchart/serial.js';
import '../../../assets/charts/amchart/light.js';
import '../../../assets/charts/amchart/pie.min.js';
import '../../../assets/charts/amchart/ammap.min.js';
import '../../../assets/charts/amchart/usaLow.js';
import '../../../assets/charts/amchart/radar.js';
import '../../../assets/charts/amchart/worldLow.js';

import dataJson from 'src/fake-data/map_data';
import mapColor from 'src/fake-data/map-color-data.json';
import { BaseService } from 'src/app/services/base.service';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SharedModule, RouterModule, DatatableComponent],
  providers: [DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tableData: any[] = [];
  constructor(private baseService: BaseService, private datePipe: DatePipe, private router: Router, private toastr: ToastrService) {

  }
  lstDaysAmount: any[] = [];
  lstWeekAmount: any[] = [];
  URL = AppConstant.url;
  globalVarTotalPatientsVisitedToday: number = 100;
  globalVarTotalMedicineStock: number = 100;
  globalVarTotalAmountOfBillGeneratedToday: number = 100;
  sales: any[] = [];
  lstFeedback: any[] = [];

  totalWeekAmount: number = 0;
  // life cycle event
  ngOnInit() {

    this.getAllDashboardCardDetails();
    this.getPatientTableDetails();
    this.gettotaldays();
    this.getTotalWeekAmount();
    this.getGetFeedbackCardDetails();
    this.getallforcountlist();

    // this.baseService.GET("https://jsonplaceholder.typicode.com/todos/1").subscribe(response => {
    //   console.log("GET Response:", response);
    // });
    // // POST request
    // this.baseService.POST("https://jsonplaceholder.typicode.com/posts", { title: 'foo', body: 'bar', userId: 1 })
    //   .subscribe(response => {
    //     console.log("POST Response:", response);
    //   });

    // // PUT request
    // this.baseService.PUT("https://jsonplaceholder.typicode.com/posts/1", { id: 1, title: 'updated', body: 'updated content', userId: 1 })
    //   .subscribe(response => {
    //     console.log("PUT Response:", response);
    //   });

    // //  DELETE request
    // this.baseService.DELETE("https://jsonplaceholder.typicode.com/posts/1")
    //   .subscribe(response => {
    //     console.log("DELETE Response:", response);
    //   });
    setTimeout(() => {
      const latlong = dataJson;

      const mapData = mapColor;

      const minBulletSize = 3;
      const maxBulletSize = 70;
      let min = Infinity;
      let max = -Infinity;
      let i;
      let value;
      for (i = 0; i < mapData.length; i++) {
        value = mapData[i].value;
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }



      const maxSquare = maxBulletSize * maxBulletSize * 2 * Math.PI;
      const minSquare = minBulletSize * minBulletSize * 2 * Math.PI;

      const images = [];
      for (i = 0; i < mapData.length; i++) {
        const dataItem = mapData[i];
        value = dataItem.value;

        let square = ((value - min) / (max - min)) * (maxSquare - minSquare) + minSquare;
        if (square < minSquare) {
          square = minSquare;
        }
        const size = Math.sqrt(square / (Math.PI * 8));
        const id = dataItem.code;

        images.push({
          type: 'circle',
          theme: 'light',
          width: size,
          height: size,
          color: dataItem.color,
          longitude: latlong[id].longitude,
          latitude: latlong[id].latitude,
          title: dataItem.name + '</br> [ ' + value + ' ]',
          value: value
        });
      }
      const chartLabels = this.lstDaysAmount.map(x => x.day);
      const chartData = this.lstDaysAmount.map(x => x.value);

      new Chart('myBarChart', {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [{
            label: 'Daily Earnings',
            data: chartData,
            backgroundColor: 'white',
            borderColor: 'rgb(230, 234, 240)',
            borderWidth: 1
          }]
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false, // Set this carefully based on your layout
          scales: {
            y: {
              type: 'linear',
              beginAtZero: true
            }
          }
        }
      });

    }, 1000);

  }





  gettotaldays() {
    this.baseService.GET<any>(this.URL + "DashboardCardDetail/GetTotalEarningsByDate").subscribe(response => {
      console.log("Days Amount", response);
      this.lstDaysAmount = response.data;
    });
  }


  getTotalWeekAmount() {
    this.baseService.GET<any>(this.URL + "DashboardCardDetail/GetTotalEarningsWeek").subscribe(response => {
      console.log("Total Week Amount", response);
      this.lstWeekAmount = response.data;
    })
  }





  dashboardCarDetailsArray: any[] = [];
  getAllDashboardCardDetails() {
    this.baseService.GET<any>(this.URL + "DashboardCardDetail/getAllDashboardCardDetails")
      .subscribe(response => {
        this.globalVarTotalPatientsVisitedToday = response.data.totalPatientsVisitedToday;
        this.globalVarTotalMedicineStock = response.data.totalMedicineStock;
        this.globalVarTotalAmountOfBillGeneratedToday = response.data.totalAmountOfBillGeneratedToday;

        // console.log(this.dashboardCarDetailsArray);
        // this.globalVarTotalAmountOfBillGeneratedToday = 600;
        // console.log("after edit total amount of bill " + this.globalVarTotalAmountOfBillGeneratedToday);
        // console.log("patients visited today " + response.data.totalPatientsVisitedToday);

        //call method to update sales array data
        this.updateSalesArrayData();

      });
  }


  getPatientTableDetails(): void {
    this.baseService.GET<any>('https://localhost:7272/api/DashboardCardDetail/GetPatientTableDetails')
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          if (Array.isArray(response.data)) {
            this.tableData = response.data.map((item: any) => ({
              treatmentDetailsId: item.treatmentDetailsId,
              totalAmount: item.totalAmount,
              paymentMethod: item.paymentMethod,
              src: item.gender === 'F'
                ? 'assets/images/user/avatar-1.jpg' : 'assets/images/user/avatar-2.jpg',
              title: item.patientName,
              text: item.docterName,
              time: this.datePipe.transform(item.finalDate, 'dd-MM-yyyy'),
              color: item.dateSource === 0
                ? 'text-c-green' : 'text-c-red'
            }));
          } else {
            console.error('Data is not an array:', response.data);
          }
        },
        error: (err) => {
          console.error('Error fetching patient table data:', err);
        }
      });
  }


  updateSalesArrayData() {
    this.sales = [
      {
        title: 'Patientspaidvisittoday',
        icon: 'icon-arrow-up text-c-green',
        amount: this.globalVarTotalPatientsVisitedToday,
        percentage: '67%',
        progress: 50,
        design: 'col-md-6',
        progress_bg: 'progress-c-theme'
      },
      {
        title: 'Medicinestock',
        icon: 'icon-arrow-down text-c-red',
        amount: this.globalVarTotalMedicineStock,
        percentage: '36%',
        progress: 35,
        design: 'col-md-6',
        progress_bg: 'progress-c-theme2'
      },
      {
        title: 'Totalamountofbillgeneratedtoday',
        icon: 'icon-arrow-up text-c-green',
        amount: this.globalVarTotalAmountOfBillGeneratedToday,
        percentage: '80%',
        progress: 70,
        design: 'col-md-12',
        progress_bg: 'progress-c-theme'
      }
    ];
  }
  getallforcountlist() {
    this.baseService.GET<any>(this.URL + "DashboardCardDetail/GetAllforcount").subscribe(response => {
      this.card[0].number = response.data?.[0]?.totalDoctorCount;
      this.card[1].number = response.data?.[1]?.totalDoctorCount;
    });
  }

  card = [
    {
      design: 'border-bottom',
      number: 1233333333333333,
      text: 'Total Doctor',
      icon: 'icon-zap text-c-green'


    },
    {
      number: '26',
      text: 'Available Doctor',
      icon: 'icon-map-pin text-c-blue'
    }
  ];

  social_card = [
    {
      design: 'col-md-12',
      icon: 'fab fa-facebook-f text-primary',
      amount: '12,281',
      percentage: '+7.2%',
      color: 'text-c-green',
      target: '35,098',
      progress: 60,
      duration: '3,539',
      progress2: 45,
      progress_bg: 'progress-c-theme',
      progress_bg_2: 'progress-c-theme2'
    },
    {
      design: 'col-md-6',
      icon: 'fab fa-twitter text-c-blue',
      amount: '11,200',
      percentage: '+6.2%',
      color: 'text-c-purple',
      target: '34,185',
      progress: 40,
      duration: '4,567',
      progress2: 70,
      progress_bg: 'progress-c-theme',
      progress_bg_2: 'progress-c-theme2'
    },
    {
      design: 'col-md-6',
      icon: 'fab fa-google-plus-g text-c-red',
      amount: '10,500',
      percentage: '+5.9%',
      color: 'text-c-blue',
      target: '25,998',
      progress: 80,
      duration: '7,753',
      progress2: 50,
      progress_bg: 'progress-c-theme',
      progress_bg_2: 'progress-c-theme2'
    }
  ];

  getGetFeedbackCardDetails() {
    this.baseService.GET<any>(this.URL + "DashboardCardDetail/GetFeedbackCardDetails")
      .subscribe(response => {
        if (Array.isArray(response?.data)) {
          this.progressing = response.data.map(item => ({
            number: item.comments || '',
            amount: item.fullName || '',
            progress: 100,
            progress_bg: 'progress-c-theme'
          }));
        }
      });
  }

  progressing = [
    {
      number: '5',
      amount: '384',
      progress: 70,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '4',
      amount: '145',
      progress: 35,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '3',
      amount: '24',
      progress: 25,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '2',
      amount: '1',
      progress: 10,
      progress_bg: 'progress-c-theme'
    },
    {
      number: '1',
      amount: '0',
      progress: 0,
      progress_bg: 'progress-c-theme'
    }
  ];

  // tables = [
  //   {
  //     src: 'assets/images/user/avatar-1.jpg',
  //     title: 'Isabella Christensen',
  //     text: 'Requested account activation',
  //     time: '11 MAY 12:56',
  //     color: 'text-c-green'
  //   },
  //   {
  //     src: 'assets/images/user/avatar-2.jpg',
  //     title: 'Ida Jorgensen',
  //     text: 'Pending document verification',
  //     time: '11 MAY 10:35',
  //     color: 'text-c-red'
  //   },
  //   {
  //     src: 'assets/images/user/avatar-3.jpg',
  //     title: 'Mathilda Andersen',
  //     text: 'Completed profile setup',
  //     time: '9 MAY 17:38',
  //     color: 'text-c-green'
  //   },
  //   {
  //     src: 'assets/images/user/avatar-1.jpg',
  //     title: 'Karla Soreness',
  //     text: 'Requires additional information',
  //     time: '19 MAY 12:56',
  //     color: 'text-c-red'
  //   },
  //   {
  //     src: 'assets/images/user/avatar-2.jpg',
  //     title: 'Albert Andersen',
  //     text: 'Approved and verified account',
  //     time: '21 July 12:56',
  //     color: 'text-c-green'
  //   }
  // ];


  onTableAction(event: { action: string, row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      bill: () => this.router.navigate(['/billing', event.row.treatmentDetailsId]),
      download: () => this.downloadRowAsPDF(event.row),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      this.toastr.warning('Unknown action', 'Warning');
    }
  }


  downloadRowAsPDF(row: any) {
    const doc = new jsPDF('p', 'pt', 'a4');

    const data = [
      `Full Name: ${row.title || 'N/A'}`,
      `Total Amount: ${row.totalAmount || 'N/A'}`,
      `Payment Method: ${row.paymentMethod || 'N/A'}`,
      `Bill Date: ${row.time || 'N/A'}`
    ];

    let y = 40;
    doc.setFontSize(12);
    data.forEach(line => {
      doc.text(line, 40, y);
      y += 20;
    });

    doc.save(`${row.patientName || 'Bill'}.pdf`);
  }
}
