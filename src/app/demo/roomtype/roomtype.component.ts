/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { ViewChild } from '@angular/core';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';

import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'app-roomtypeess',
  standalone: true,
  imports: [SharedModule, PopUpComponent, DatatableComponent],
  templateUrl: './roomtype.component.html',
  styleUrls: ['./roomtype.component.scss']
})
export class RoomTypesComponent implements OnInit {

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

  lstroomtype: any[] = [];
  paginatedList: any[] = [];
  isShowList: boolean = true;
  selectedRoomTypeId: number | null = null;
  URL = AppConstant.url
  http = inject(HttpClient)


  //   @ViewChild('deleteModal') deleteModal!: PopUpComponent;
  // roomTypeIdToDelete: number | null = null;


  showPopup = false;
  roomTypeIdDelete: number | null = null;



  tableHeaders = [
    { label: 'RoomType', key: 'roomType' },
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
    this.permission = this.permissionService.getPermissions("RoomType");
  }

  ngOnInit() {
    this.createFormGroup();
    this.getRoomType();
    this.setPermissions = this.permissionService.getPermissions("RoomType");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }

  roomTypefmGroup: FormGroup;

  // Page NAvigation
  currentPage: number = 1; //currect page number
  itemsPerPage: number = AppConstant.RecordPerPage;  //total data in page
  totalPages: number = 0; //total page
  pageNumbers: number[] = [];//list





  createFormGroup() {
    this.roomTypefmGroup = new FormGroup({
      roomTypeId: new FormControl(0, [Validators.required]),
      roomType: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(255)]),
    })
  }

  resetForm() {
    this.isShowList = false;
    this.createFormGroup();
    this.selectedRoomTypeId = null;
  }


  checkRequired(controlName: any) {
    return this.roomTypefmGroup.controls[controlName].touched && this.roomTypefmGroup.controls[controlName].errors?.['required'];
  }


  checkminlength(controlName: any) {
    return this.roomTypefmGroup.controls[controlName].touched && this.roomTypefmGroup.controls[controlName].errors?.['minlength']
  }

  checkmaxlength(controlName: any) {
    return this.roomTypefmGroup.controls[controlName].touched && this.roomTypefmGroup.controls[controlName].errors?.['maxLength']
  }


  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.lstroomtype.slice(startIndex, endIndex);
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






  getRoomType() {
    this.baseService.GET<any>(this.URL + "TblRoomType/GetAll").subscribe(response => {
      console.log("GET Response:", response);
      this.lstroomtype = response.data;
      this.totalPages = Math.ceil(this.lstroomtype.length / this.itemsPerPage);
      this.Paginationrecord();
      this.PageNumber();
    });
  }

  AddRoomType() {
    this.baseService.POST(this.URL + "TblRoomType/Add", this.roomTypefmGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("POST Response:", response);
            this.getRoomType(); // Refresh list
            this.isShowList = true;
            this.currentPage = 1
            this.roomTypefmGroup.reset({
              roomTypeId: 0,
              roomType: ''
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


  editRoom(room: any) {
    this.selectedRoomTypeId = room.roomTypeId;
    this.isShowList = false;
    this.roomTypefmGroup.patchValue({
      roomTypeId: room.roomTypeId,
      roomType: room.roomType
    });
  }


  updateRoom() {
    this.baseService.PUT(this.URL + "TblRoomType/Update", this.roomTypefmGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("PUT Response:", response);
            this.getRoomType();
            this.resetForm();
            this.isShowList = true;
            this.currentPage = 1;

          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to update ', 'Error');
        }
      });
  }



  onDelete(roomTypeId: number) {



    this.baseService.DELETE(this.URL + "TblRoomType/delete?id=" + roomTypeId).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("DELETE Response:", response);
          this.getRoomType();
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


  // -----------------


  openDeleteModal(id: number) {
    this.roomTypeIdDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.roomTypeIdDelete !== null) {
      this.onDelete(this.roomTypeIdDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.roomTypeIdDelete = null;
    this.showPopup = false;
  }



  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editRoom(event.row),
      delete: () => this.openDeleteModal(event.row.roomTypeId),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }

}
