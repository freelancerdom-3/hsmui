/* eslint-disable no- */
//* eslint-disable no- */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';


@Component({
  selector: 'app-hospitaltype',
  standalone: true,
  imports: [SharedModule, RouterModule, DatatableComponent],

  templateUrl: './PatientAdmitionDetails.component.html',
  styleUrls: ['./PatientAdmitionDetails.component.scss']
})
export class PatientAdmitionDetailsComponent implements OnInit {
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

  PatientAdmitionDetails: any[] = [];
  // PAGINATION
  paginatedList: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  itemsPerPage: number = AppConstant.RecordPerPage;
  pageNumbers: number[] = [];


  selectedPatientName: any = '';

  PatientAdmitionDetailslst: any[] = [];
  Roomlist: any[] = [];
  TreatmentDetailsCodelist: any[] = [];


  isShowList: boolean = true;
  selectedHospitalId: number | null = null;
  URL = AppConstant.url;

  tableHeaders = [
    { label: 'PatientName', key: 'patientName' },
    { label: 'DieseaseName', key: 'dieseaseName' },
    { label: 'AdmisionDate', key: 'admisionDate' },
    { label: 'RoomNumber', key: 'roomNumber' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];


  constructor(
    private baseService: BaseService,
    private toastr: ToastrService,
    private router: Router,
    private permissionService: PermissionService
  ) {
    this.permission = this.permissionService.getPermissions("AdmissionDetails");
  }

  ngOnInit() {
    this.createFormGroup();
    this.getPatientAdmitionDetails();
    this.Roomame();
    this.TreatmentDetailsCodes();
    this.setPermissions = this.permissionService.getPermissions("AdmissionDetails");

    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }
  PatientAdmitionDetailsformGroup: FormGroup;

  createFormGroup() {

    this.PatientAdmitionDetailsformGroup = new FormGroup({
      PatientAdmitionDetailsId: new FormControl(0, [Validators.required]),
      AdmisionDate: new FormControl(null, [Validators.required]),
      roomID: new FormControl(null, [Validators.required]),
      treatmentDetailsId: new FormControl(null, [Validators.required])


    })
  }


  resetForm() {
    this.isShowList = false;
    this.createFormGroup();
    this.selectedHospitalId;
  }


  checkRequired(controlName: any) {
    return this.PatientAdmitionDetailsformGroup.controls[controlName].touched && this.PatientAdmitionDetailsformGroup.controls[controlName].errors?.['required'];
  }



  getPatientAdmitionDetails() {
    this.baseService.GET<any>(this.URL + "TblPatientAdmitionDetails/GetAll").subscribe(response => {
      this.PatientAdmitionDetails = response.data || [];
      this.totalRecords = this.PatientAdmitionDetails.length;
      this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
      this.PageNumber();
      this.Paginationrecord();
    });
  }


  addPatientAdmitionDetails() {


    this.baseService.POST(this.URL + "TblPatientAdmitionDetails/Add", this.PatientAdmitionDetailsformGroup.getRawValue()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("POST Response:", response);
          this.getPatientAdmitionDetails();


          this.PatientAdmitionDetailsformGroup.reset({
            PatientAdmitionDetailsId: 0,
            AdmisionDate: null,
            roomID: null,
            treatmentDetailsId: null
          });
          this.isShowList = true;
          this.isShowList = true;
          this.currentPage = 1;
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


  Roomame() {

    this.baseService.GET<any>(this.URL + "GetDropDownList/FillRoomtype")
      .subscribe(response => {
        console.log("Department Name:", response);
        this.Roomlist = response.data;
      });
  }

  TreatmentDetailsCodes() {

    console.log("heello")
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillTreatmentCode")
      .subscribe(response => {
        console.log("Department Name:", response);
        this.TreatmentDetailsCodelist = response.data;
      });
  }


  onPatientNameChange(event: any) {
    const selectedId = +event.target.value;
    const selectedPatient = this.TreatmentDetailsCodelist.find(p => p.id === selectedId);

    if (selectedPatient) {
      this.selectedPatientName = selectedPatient.name;
      this.selectedHospitalId = selectedPatient.id;

      this.PatientAdmitionDetailsformGroup.patchValue({
        treatmentDetailsId: selectedPatient.id
      });
    }
  }




  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      //edit: () => this.onPatientNameChange(event.row),
      //delete: () => this.onDelete(event.row.PatientAdmitionDetailsId),
      bill: () => this.router.navigate(['/billing', event.row.treatmentDetailsId]),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }


  //PAGINATION STOP
  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.PatientAdmitionDetails.slice(startIndex, endIndex);
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
}
