/* eslint-disable no- */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule, } from '@angular/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';

import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';

@Component({
  selector: 'app-treatmentdetails',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, DatatableComponent, PopUpComponent],
  templateUrl: './treatmentdetails.component.html',
  styleUrls: ['./treatmentdetails.component.scss']

})

export class TreatmentdetailsComponent implements OnInit {

  submitForm() {
    throw new Error('Method not implemented.');
  }
  setPermissions: any;
  canAdd: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canView: boolean = false;
  permission: any;
  actionButtons = [];

  treatmentdetailslist: any[] = [];
  paginatedList: any[] = []; // Paginated data
  isShowList: boolean = true;
  selectedtreatmentDetailsId: number | null = null;  // Store selected hospital ID for update
  diseaselist: any[] = [];
  patientlist: any[] = [];

  tableHeaders = [
    { label: 'DieseaseName', key: 'dieseaseName' },
    { label: 'Patient Name', key: 'patientName' },
    { label: 'TreatmentDate', key: 'treatmentDate' },
    { label: 'Created By', key: 'createdBy' },
    { label: 'Created On', key: 'createdOn' },
    { label: 'Updated By', key: 'updatedBy' },
    { label: 'Updated On', key: 'updatedOn' },
    { label: 'Is Active', key: 'isActive' }
  ];





  http = inject(HttpClient)
  mydate = new Date().toISOString().slice(0, 10);


  showPopup = false
  treatmentDetailsIdDelete: number | null = null

  constructor
    (
      private baseService: BaseService,
      private toastr: ToastrService,
      private permissionService: PermissionService
    ) {
    this.permission = this.permissionService.getPermissions("TreatmentDetails");
  }

  // life cycle event
  ngOnInit() {
    this.createFormGroup();
    this.gettreatmentdetails();
    this.getdisease();
    this.getpateint();
    this.setPermissions = this.permissionService.getPermissions("TreatmentDetails");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }



  treatmentDetailsFormGroup: FormGroup
  // Pagination properties
  currentPage: number = 1; //currect page number
  itemsPerPage: number = AppConstant.RecordPerPage;
  totalPages: number = 0; //total page
  pageNumbers: number[] = [];//list
  URL = AppConstant.url;


  createFormGroup() {

    this.treatmentDetailsFormGroup = new FormGroup({
      treatmentDetailsId: new FormControl(0, [Validators.required]),
      dieseaseTypeID: new FormControl(null, [Validators.required]),
      patientId: new FormControl(null, [Validators.required]),
      treatmentDate: new FormControl(null, [Validators.required]),
      // treatmentCode:new FormControl(null,[Validators.required])



    })
  }
  checkRequired(controlName: any) {
    return this.treatmentDetailsFormGroup.controls[controlName].touched && this.treatmentDetailsFormGroup.controls[controlName].errors?.['required'];
  }


  checkminlength(controlName: any) {
    return this.treatmentDetailsFormGroup.controls[controlName].errors?.['minlength'];
  }

  gettreatmentdetails() {
    this.baseService.GET<any>(this.URL + "TblTreatmentDetails/GetAll").subscribe(response => {
      console.log("Get Response:", response);
      this.treatmentdetailslist = response.data;
      this.totalPages = Math.ceil(this.treatmentdetailslist.length / this.itemsPerPage); // FIX: Update total pages
      this.Paginationrecord();//update list
      this.PageNumber(); // FIX: Update page numbers
    });
  }
  add() {
    this.isShowList = false;
    this.createFormGroup();
    this.selectedtreatmentDetailsId = null;
  }

  Addtreatmentdetails() {
    this.baseService.POST(this.URL + "TblTreatmentDetails/Add", this.treatmentDetailsFormGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("POST Response:", response);
            this.gettreatmentdetails();
            this.isShowList = true;
            this.treatmentDetailsFormGroup.reset({
              treatmentDetailsId: 0,
              dieseaseTypeID: '',
              patientId: '',
              treatmentDate: '',
              treatmentCode: '',

            });
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to update ', 'Error');
        }
      });
  }
  edittreatmentdetails(treatmentdetails: any) {
    this.selectedtreatmentDetailsId = treatmentdetails.treatmentDetailsId;
    this.isShowList = false; //showList

    const dateObj = new Date(treatmentdetails.treatmentDate);
    const formattedDate = dateObj.toISOString().slice(0, 10);
    this.treatmentDetailsFormGroup.patchValue({
      treatmentDetailsId: treatmentdetails.treatmentDetailsId,
      dieseaseTypeID: treatmentdetails.dieseaseTypeID, // ID
      patientId: treatmentdetails.patientId, // NAME
      treatmentDate: formattedDate,
      treatmentCode: treatmentdetails.treatmentCode

    });
  }


  updatetreatmentdetails() {

    this.baseService.PUT(this.URL + "TblTreatmentDetails/Update", this.treatmentDetailsFormGroup.getRawValue())// No ID in the URL
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            this.gettreatmentdetails();
            this.isShowList = true;

            // this.medicineTypeFormGroup.reset({
            //   medicineTypeID: 0,
            //   typeName: ''

            //     })
          }

          this.currentPage = 1;

          // this.selectedHospitalId = null;
        }

      });
  }
  onDelete(treatmentDetailsId: number) {
    this.baseService.DELETE(this.URL + "TblTreatmentDetails/Delete?Id=" + treatmentDetailsId).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("DELETE Response:", response);
          this.gettreatmentdetails();
          this.isShowList = true;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: () => {
        this.toastr.error('Failed to delete ', 'Error');
      }
    });
  }




  openDeleteModal(id: number) {
    this.treatmentDetailsIdDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.treatmentDetailsIdDelete !== null) {
      this.onDelete(this.treatmentDetailsIdDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.treatmentDetailsIdDelete = null;
    this.showPopup = false;
  }


  // getdisease() {
  //     this.baseService.GET<any>(this.URL+"GetDropDownList/FillDiseaseName").subscribe(response => {
  //       console.log("Get response:", response);
  //       // Assuming response.data contains an array of items
  //       if (response.data) {
  //         this.diseaselist = response.data; // Populate dropdown list with fetched data
  //       } else {
  //         console.error("No data found in the response!");
  //       }
  //     });
  //   }

  getdisease() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillDiseaseName").subscribe(response => {
      console.log("GET Response:", response);
      this.diseaselist = response.data;
      console.log("disease", this.diseaselist);
    })
  }

  getpateint() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillPatientName").subscribe(response => {
      console.log("GET Response:", response);
      this.patientlist = response.data;
      console.log("patient", this.patientlist);
    })
  }







  //record for the page
  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.treatmentdetailslist.slice(startIndex, endIndex);
  }

  //page number
  PageNumber() {
    this.pageNumbers = [];
    for (let i = 1; i <= Math.min(this.totalPages, 3); i++) {
      this.pageNumbers.push(i);
    }
  }
  //change page
  nextpage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.Paginationrecord();
    }
  }

  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.edittreatmentdetails(event.row),
      delete: () => this.openDeleteModal(event.row.treatmentDetailsId),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }


}



