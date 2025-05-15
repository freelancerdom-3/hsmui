import { Component,inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import * as jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';


@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [SharedModule, DatatableComponent],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class feedbackComponent implements OnInit {
  feedbacks: any[] = [];
  patientlist: any[];
  TreatmentcodeList: any[] = [];
  treatmentdetailsidwithnamelist: any[] = [];

  paginatedList: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  itemsPerPage: number = AppConstant.RecordPerPage;
  pageNumbers: number[] = [];

  isShowList: boolean = true;
  selectedfeedbackId: number | null = null;
  URL = AppConstant.url;
  http = inject(HttpClient);

  tableHeaders = [
    { label: 'Sr.N', key: 'srno' },
    { label: 'FullName', key: 'fullName' },
    { label: 'Comments', key: 'comments' },
    { label: 'Rating', key: 'rating' },
    { label: 'Feedback Date', key: 'feedbackDate' },
    { label: 'Treatment Details ID', key: 'treatmentDetailsId' },
  { label: 'Created By', key: 'createdBy' },
  { label: 'Created On', key: 'createdOn' },
  { label: 'Updated By', key: 'updatedBy' },
  { label: 'Updated On', key: 'updatedOn' },
  { label: 'Is Active', key: 'isActive' },
  { label: 'Version No', key: 'versionNo' }
  ];

  constructor(
    private baseService: BaseService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getfeedback();
    this.createFormGroup();
    this.gettreatmentdetailsidwithname();

    const admitionId = this.route.snapshot.paramMap.get('id');
    if (admitionId) {
      this.feedbackfmGroup.patchValue({
        treatmentDetailsId: parseInt(admitionId)
      });
      this.isShowList = false;
    }
  }

  feedbackfmGroup: FormGroup;

  createFormGroup() {
    const today = new Date().toISOString().split('T')[0];
    this.feedbackfmGroup = new FormGroup({
      feedbackId: new FormControl(0, [Validators.required]),
      rating: new FormControl('', [Validators.required]),
      feedbackDate: new FormControl(today, [Validators.required]),
      treatmentDetailsId: new FormControl(0, [Validators.required]),
      comment: new FormControl('', [Validators.required])
    });
    console.log("Form Initialized:", this.feedbackfmGroup.value);
  }

  getfeedback() {
    this.baseService.GET<any>(this.URL + "TblFeedback/GetAll").subscribe({
      next: (response) => {
        console.log("GET Response:", response);
        this.feedbacks = response.data.map((x: any, i: number) => ({
          srno: i + 1,
          feedbackId: x.feedbackId,
          fullName: x.fullName,
          comments: x.comments,
          rating: x.rating,
          feedbackDate: x.feedbackDate,
          treatmentDetailsId: x.treatmentDetailsId,
          createdBy: x.createdBy,
          createdOn: x.createdOn,
          updatedBy: x.updatedBy,
          updatedOn: x.updatedOn,
          isActive: x.isActive,
          versionNo: x.versionNo
        }));
        this.totalRecords = this.feedbacks.length;
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
        this.PageNumber();
        this.Paginationrecord();
      },
      error: (err) => {
        this.toastr.error('Failed to fetch feedback', 'Error');
        console.error("GET Error:", err);
      }
    });
  }


  addfeedback() {
    const data = this.feedbackfmGroup.getRawValue();
    console.log("Submitting feedback Data:", data);

    this.baseService.POST(this.URL + "TblFeedback/Add", data).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          this.getfeedback();
          this.isShowList = true;
          this.currentPage = 1;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Failed', 'Error');
        console.error("POST Error:", err);
      }
    });
  }

  delete(row: any) {
    const id = row.feedbackId;

    this.baseService.DELETE(this.URL + "TblFeedback/Delete?id=" + id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          this.getfeedback();
          this.isShowList = true;
          this.currentPage = 1;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Failed', 'Error');
        console.error("DELETE Error:", err);
      }
    });
  }


  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      delete: () => this.delete(event.row),
    };
    const actionKey = event.action.toLowerCase();
    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }

  gettreatmentdetailsidwithname() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillTreatmentCode").subscribe(response => {
      this.treatmentdetailsidwithnamelist = response.data;
      console.log("treatmentdetailslistwithname", this.treatmentdetailsidwithnamelist);
    });
  }

  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.feedbacks.slice(startIndex, endIndex);
  }

  PageNumber() {
    this.pageNumbers = [];
    for (let i = 1; i <= Math.min(this.totalPages, 3); i++) {
      this.pageNumbers.push(i);
    }
  }

  nextpage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.Paginationrecord();
    }
  }
}
