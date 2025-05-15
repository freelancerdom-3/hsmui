/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';



@Component({
  selector: 'app-empshiftmapping',
  standalone: true,
  imports: [SharedModule, PopUpComponent, DatatableComponent],
  templateUrl: './empshiftmapping.component.html',
  styleUrls: ['./empshiftmapping.component.scss']
})
export class empshiftmapping implements OnInit {

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

  lstempshiftmapping: any[] = [];
  isShowList: boolean = true;
  employeeshiftMappingId: number | null = null;
  lstShifts: any[] = [];
  lstUserNames: any[] = [];



  showPopup = false;
  employeeshiftMappingIdToDelete: number | null = null;


  tableHeaders = [
    { label: 'FullName', key: 'fullName' },
    { label: 'ShiftName', key: 'shiftname' },
    { label: 'StartingDate', key: 'employeeshiftMappingStartingDate' },
    { label: 'EndingDate', key: 'employeeshiftMappingStartingDate' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];


  constructor
    (
      private baseService: BaseService,
      private toastr: ToastrService,
      private permissionService: PermissionService
    ) {
    this.permission = this.permissionService.getPermissions("Employeeshift");
  }

  ngOnInit() {
    this.createFormGroup();
    this.getShifts();
    this.getUserNames();
    this.getEmpShiftMapping();
    this.setPermissions = this.permissionService.getPermissions("Employeeshift");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }

  empshiftmappingfmGroup: FormGroup;

  // Page NAvigation
  paginatedList: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  itemsPerPage: number = AppConstant.RecordPerPage;
  pageNumbers: number[] = [];
  URL = AppConstant.url




  createFormGroup() {
    this.empshiftmappingfmGroup = new FormGroup({
      employeeshiftMappingId: new FormControl(0, [Validators.required]),
      userId: new FormControl(null, [Validators.required]),
      shiftId: new FormControl(null, [Validators.required]),
      employeeshiftMappingStartingDate: new FormControl(null, [Validators.required]),
      employeeshiftMappingEndingDate: new FormControl(null, [Validators.required])
    });
  }

  resetForm() {
    this.isShowList = false;
    this.createFormGroup();
    this.employeeshiftMappingId = null;
  }



  checkRequired(controlName: any) {
    return this.empshiftmappingfmGroup.controls[controlName].touched && this.empshiftmappingfmGroup.controls[controlName].errors?.['required'];
  }


  checkminlength(controlName: any) {
    return this.empshiftmappingfmGroup.controls[controlName].errors?.['minlength']
  }


  //PAGINATION STOP
  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.lstempshiftmapping.slice(startIndex, endIndex);
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



  getShifts() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillShift")
      .subscribe(response => {
        console.log("Shift:", response);
        this.lstShifts = response.data;
      });
  }






  getUserNames() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillUserName")
      .subscribe(response => {
        console.log("User Name:", response);
        this.lstUserNames = response.data;
      });
  }


  getEmpShiftMapping() {
    this.baseService.GET<any>(this.URL + "TblEmployeeshiftMapping/GetAll").subscribe(response => {
      console.log("GET Response:", response);
      this.lstempshiftmapping = response.data;
      this.totalPages = Math.ceil(this.lstempshiftmapping.length / this.itemsPerPage); // FIX: Update total pages
      this.Paginationrecord();
      this.PageNumber();
    });
  }




  AddEmpShift() {
    this.baseService.POST(this.URL + "TblEmployeeshiftMapping/Add", this.empshiftmappingfmGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            console.log("POST Response:", response);
            this.getEmpShiftMapping();
            this.Paginationrecord();
            this.isShowList = true;
            this.currentPage = 1;
            this.toastr.success(' Added Successfully!', 'Success');
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to Add ', 'Error');
        }

      });
  }



  editEmpShift(item: any) {

    this.employeeshiftMappingId = item.employeeshiftMappingId;
    this.isShowList = false;

    const dateobj = new Date(item.employeeshiftMappingStartingDate);
    const formatdate = dateobj.toISOString().slice(0, 10);
    const dateonj1 = new Date(item.employeeshiftMappingEndingDate);
    const formatdate1 = dateonj1.toISOString().slice(0, 10);
    this.empshiftmappingfmGroup.patchValue({
      employeeshiftMappingId: item.employeeshiftMappingId,
      userId: item.userId,
      shiftId: item.shiftId,
      employeeshiftMappingStartingDate: formatdate,
      employeeshiftMappingEndingDate: formatdate1,
    });
  }



  updateEmpShift() {

    this.baseService.PUT(this.URL + "TblEmployeeshiftMapping/Update", this.empshiftmappingfmGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            console.log("PUT Response:", response);
            this.getEmpShiftMapping();
            this.resetForm();
            this.isShowList = true;
            this.currentPage = 1;
            this.toastr.success(' Updated Successfully!', 'Success');
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to Update ', 'Error');
        }

      });
  }



  onDelete(employeeshiftMappingId: number) {
    this.baseService.DELETE(this.URL + "TblEmployeeshiftMapping/delete?id=" + employeeshiftMappingId)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            console.log("DELETE Response:", response);
            this.getEmpShiftMapping();
            this.toastr.success('Deleted successfully!', 'Success');
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to Delete ', 'Error');
        }

      });
  }

  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editEmpShift(event.row),
      delete: () => this.openDeleteModal(event.row.employeeshiftMappingId),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }





  openDeleteModal(id: number) {
    this.employeeshiftMappingIdToDelete = id;
    this.showPopup = true;
  }


  confirmDelete() {
    if (this.employeeshiftMappingIdToDelete !== null) {
      this.onDelete(this.employeeshiftMappingIdToDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  aand ResetID
  private cleanupPopup() {
    this.employeeshiftMappingIdToDelete = null;
    this.showPopup = false;
  }
}
