//import { IDropdownSettings } from './../../../../node_modules/ng-multiselect-dropdown/multiselect.model.d';
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup,Validators} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
//import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@Component({
  selector: 'app-patientdata',
  standalone: true,
  imports: [SharedModule, DatatableComponent, NgMultiSelectDropDownModule ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class userComponent implements OnInit {
  patients: any[] = [];
  patientlist :any[];
  // PAGINATION
  paginatedList: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  itemsPerPage: number = AppConstant.RecordPerPage;
  pageNumbers: number[] = [];

  isShowList: boolean = true;
  selectedPatientId: number = 0;
  selectedHospitalId: number | null = null;
  URL = AppConstant.url;
  http = inject(HttpClient);
  //new
  MenuPermissionlist : any[]=[]

  tableHeaders = [
    { label: 'Name', key: 'fullName' },
   // { label: 'createdOn', key: 'createdOn' },
    { label: 'RoleName', key: 'roleNames'}
   // { label: 'Action', key: 'action' }

  ];
  constructor(
    private baseService: BaseService,
    private toastr: ToastrService,
    private permissionService: PermissionService
  ){}
  ngOnInit() {
    debugger
    this.createFormGroup();
    this.getPatients();
    this.getrolename();
  }
  UserFormGroup:FormGroup;

  createFormGroup() {
  this.UserFormGroup = new FormGroup({
    userId: new FormControl(0, [Validators.required]),
    roleIds: new FormControl([], [Validators.required]) // now it's an array
  });
}
  checkRequired(controlName:any)
     {
      return this.UserFormGroup.controls[controlName].touched &&  this.UserFormGroup.controls[controlName].errors?.['required'];
     }

  getPatients() {
    this.baseService.GET<any>(this.URL + "TblUserRoleMapping/GetAll").subscribe({
      next: (response) => {
        this.patients = response.data;
        this.totalRecords = this.patients.length;
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
        this.PageNumber();
        this.Paginationrecord();
        console.log(response.data);
      }
    });
}
  editHospital(user: any) {
     this.selectedHospitalId = user.userId;
     this.isShowList = false;
     this.UserFormGroup.patchValue({
      userId: user.userId,
       roleIds: user.roleIds || [],
    });
  }
  updateUser() {
      const rawData = this.UserFormGroup.getRawValue();

  const payload = {
    userId: rawData.userId,
    roleIds: rawData.roleIds.map((role: any) => role.id) // extract only IDs
  };
      console.log("Update button clicked", payload);
    this.baseService.PUT("https://localhost:7272/api/TblUserRoleMapping/ToggleUserRoles", payload)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            this.getPatients();
            this.isShowList = true;
            this.currentPage = 1;
            this.Paginationrecord();
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to update', 'Error');
        }
      });
  }


// new
getrolename(){
  this.baseService.GET<any>(this.URL+"GetDropDownList/FillRoles").subscribe(response => {
    console.log("GET Response:", response);
    this.MenuPermissionlist = response.data;
  })
}
  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editHospital(event.row),
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
    this. Paginationrecord();
  }
}

//selectedRoles: any[] = [];

dropdownSettings = {
  singleSelection: false,
  idField: 'id',
  textField: 'name',
  selectAllText: 'Select All',
  unSelectAllText: 'Unselect All',
  itemsShowLimit: 3,
  allowSearchFilter: false
};

}

