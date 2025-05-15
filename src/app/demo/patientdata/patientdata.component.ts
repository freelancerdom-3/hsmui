import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'app-patientdata',
  standalone: true,
  imports: [SharedModule, PopUpComponent, DatatableComponent],
  templateUrl: './patientdata.component.html',
  styleUrls: ['./patientdata.component.scss']
})
export class PatientDataComponent implements OnInit {
  patients: any[] = [];
  patientlist: any[];
  // PAGINATION
  paginatedList: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  itemsPerPage: number = AppConstant.RecordPerPage;
  pageNumbers: number[] = [];

  isShowList: boolean = true;
  bloodGroups: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  selectedPatientId: number = 0;
  selectUserid: number = 0
  URL = AppConstant.url;
  http = inject(HttpClient);

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

  tableHeaders = [
    { label: 'PatientID', key: 'patientId' },
    { label: 'FullName', key: 'fullName' },
    { label: 'DOB', key: 'dob' },
    { label: 'Gender', key: 'gender' },
    { label: 'Address', key: 'address' },
    { label: 'BloodGroup', key: 'blood_Group' },
    { label: 'EmergencyContact', key: 'emergency_Contact' },
    { label: 'MedicalHistory', key: 'medical_History' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];



  showPopup = false
  UserIdDelete: number | null = null;

  constructor(
    private baseService: BaseService,
    private toastr: ToastrService,
    private permissionService: PermissionService
  ) {
    this.permission = this.permissionService.getPermissions("PatientData");
  }

  ngOnInit() {

    this.getPatients();
    //this.patientFormGroup();
    this.getdropdown();
    this.setPermissions = this.permissionService.getPermissions("PatientData");
    this.actionButtons = [];
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
    // switch (true) {
    //   case this.setPermissions.isEdit === true:
    //     this.actionButtons.push("edit");
    //     break;
    //     // No break, so fall through
    //   case this.setPermissions.isDelete === true:
    //     this.actionButtons.push("delete");
    //     break;
    // }

  }

  patientFormGroup = new FormGroup({
    fullName: new FormControl(''),
    email: new FormControl(''),
    // password: new FormControl(''),
    mobileNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern(/^[0-9]*$/)
    ]),
    dob: new FormControl(''),
    gender: new FormControl(''),
    address: new FormControl(''),
    blood_Group: new FormControl(''),
    emergency_Contact: new FormControl(''),
    medical_History: new FormControl(''),

  });
  checkValidation(controlName: string) {
    const control = this.patientFormGroup.controls[controlName];
    if (control.errors) {
      if (control.errors['minlength']) {
        return 'Minimum length is ' + control.errors['minlength'].requiredLength + ' digits.';
      }
      if (control.errors['maxlength']) {
        return 'Maximum length is ' + control.errors['maxlength'].requiredLength + ' digits.';
      }
      if (control.errors['pattern']) {
        return 'Only numbers are allowed.';
      }
    }
    return null;
  }




  getPatients() {
    this.baseService.GET<any>(this.URL + "TblPatient/GetAll").subscribe({
      next: (response) => {
        this.patients = response.data;
        this.totalRecords = this.patients.length;
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
        this.PageNumber();
        this.Paginationrecord();

      }
    });
  }
  getdropdown() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillPatientName").subscribe({
      next: (response) => {
        this.patientlist = response.data;
      }
    });

  }
  editPatient(patient: any) {
    this.selectUserid = patient.userId;
    this.selectedPatientId = patient.patientId;
    console.log('UserId:', this.selectUserid); // should print number, not undefined

    console.log('UserId:', this.selectUserid);
    console.log('PatientId:', this.selectedPatientId);
    this.isShowList = false;
    this.patientFormGroup.patchValue(patient);
  }

  updatePatient() {
    const updateData = {
      ...this.patientFormGroup.getRawValue(),
      userId: this.selectUserid,
      patientId: this.selectedPatientId,
      updatedBy: this.selectUserid,
      updatedOn: new Date(),
      isActive: true
    };

    this.baseService.PUT(this.URL + "TblPatient/Update", updateData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            this.getPatients();
            this.isShowList = true;
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: (err) => {
          console.error('Update error:', err);
          this.toastr.error('Failed to update', 'Error');
        }
      });
  }


  onDelete(UserId: number) {
    this.baseService.DELETE(this.URL + "TblPatient/Delete?UserId=" + UserId)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            this.getPatients();
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
    this.UserIdDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.UserIdDelete !== null) {
      this.onDelete(this.UserIdDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.UserIdDelete = null;
    this.showPopup = false;
  }




  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editPatient(event.row),
      delete: () => this.openDeleteModal(event.row.UserId),
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
    this.paginatedList = this.patients.slice(startIndex, endIndex);
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

