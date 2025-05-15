/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppConstant } from '../baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';





@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [SharedModule, PopUpComponent, DatatableComponent],
  templateUrl: './facility.component.html',
  styleUrls: ['./facility.component.scss']
})

export class facility implements OnInit {

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

  lstfacility: any[] = [];
  paginatedList: any[] = [];
  isShowList: boolean = true;
  lstfacilityName: any[] = [];
  lstfacilityType: any[] = [];
  facilityID: number | null = null;
  http = inject(HttpClient)

  facilityfmGroup: FormGroup;

  // Page NAvigation
  currentPage: number = 1; //currect page number
  itemsPerPage: number = 5; //total data in page
  totalPages: number = 0; //total page
  pageNumbers: number[] = [];//list
  URL = AppConstant.url



  showPopup = false
  facilityidDelete: number | null = null;
  tableHeaders = [
    { label: 'FacilityName', key: 'facilityName' },
    { label: 'FacilityType', key: 'facilityName' },
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
    this.permission = this.permissionService.getPermissions("Master");
  }

  ngOnInit() {
    this.createFormGroup();
    this.getfacility();
    this.getfacilityname();
    this.getfacilitytype();
    this.setPermissions = this.permissionService.getPermissions("Master");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }

  createFormGroup() {
    this.facilityfmGroup = new FormGroup({
      facilityID: new FormControl(null),
      facilityName: new FormControl(null, Validators.required),
      facilityTypeID: new FormControl(null, Validators.required)
    });
  }

  checkRequired(controlName: string) {
    return this.facilityfmGroup.controls[controlName].errors?.['required'];
  }

  resetForm() {
    this.isShowList = false;
    this.createFormGroup();
    this.facilityID = null;
  }
  getfacilityname() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillFacilityName")
      .subscribe(response => {
        console.log("Facility Name:", response);
        this.lstfacilityName = response.data;
      });
  }

  getfacilitytype() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillFacilityType")
      .subscribe(response => {
        console.log('Facility type response:', response);
        this.lstfacilityType = response.data;

      });
  }


  getfacility() {
    this.baseService.GET<any>(this.URL + "TblFacility/GetAll").subscribe(response => {
      this.lstfacility = response.data;
      this.totalPages = Math.ceil(this.lstfacility.length / this.itemsPerPage);
      this.Paginationrecord();
      this.PageNumber();
    });
  }


  Addfacility() {
    const formValues = this.facilityfmGroup.getRawValue();
    console.log("Form Values Before Add:", formValues); // Debugging log

    if (this.facilityfmGroup.invalid) {
      this.toastr.error('Please fill all required fields', 'Error');
      return;
    }

    this.baseService.POST(this.URL + "TblFacility/Add", this.facilityfmGroup.getRawValue()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          this.getfacility();
          this.facilityfmGroup.reset();
          this.isShowList = true;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: (error) => {
        console.error("POST Error:", error); // Log error for debugging
        this.toastr.error('Failed to Add', 'Error');
      }
    });
  }



  editfacility(item: any) {
    this.facilityID = item.facilityID;
    this.isShowList = false;
    this.facilityfmGroup.patchValue({
      facilityID: item.facilityID,
      facilityName: item.facilityName,
      facilityTypeID: item.facilityTypeID
    });
  }

  updatefacility() {
    this.baseService.PUT(this.URL + "TblFacility/Update", this.facilityfmGroup.getRawValue()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Updated');
          this.getfacility();
          this.facilityfmGroup.reset();
          this.facilityID = null;
          this.isShowList = true;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: () => {
        this.toastr.error('Failed to Update', 'Error');
      }
    });
  }



  //delete Facility

  onDelete(facilityID: number) {
    this.baseService.DELETE(this.URL + "TblFacility/Delete?ID=" + facilityID).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("DELETE Response:", response);
          this.getfacilityname();
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
    this.facilityidDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.facilityidDelete !== null) {
      this.onDelete(this.facilityidDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.facilityidDelete = null;
    this.showPopup = false;
  }




  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editfacility(event.row),
      delete: () => this.openDeleteModal(event.row.facilityID),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }

  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.lstfacility.slice(startIndex, endIndex);
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




