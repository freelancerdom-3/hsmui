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
  selector: 'app-rooms',
  standalone: true,
  imports: [SharedModule, PopUpComponent, DatatableComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})

export class room implements OnInit {

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

  lstroom: any[] = [];
  paginatedList: any[] = [];
  isShowList: boolean = true;
  lstRoomName: any[] = [];
  lstroomnumber: any[] = [];
  roomID: number | null = null;
  http = inject(HttpClient)

  roomfmGroup: FormGroup;

  // Page NAvigation
  currentPage: number = 1; //currect page number
  itemsPerPage: number = 5; //total data in page
  totalPages: number = 0; //total page
  pageNumbers: number[] = [];//list
  URL = AppConstant.url



  showPopup = false
  roomIdDelete: number | null = null;
  tableHeaders = [
    { label: 'RoomNumber', key: 'roomNumber' },
    { label: 'RoomTypename', key: 'roomType' },
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
    this.permission = this.permissionService.getPermissions("Room");
  }

  ngOnInit() {
    this.createFormGroup();
    this.getroomname();
    this.getroom();
    this.getroomnumber();
    this.setPermissions = this.permissionService.getPermissions("Room");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }

  createFormGroup() {
    this.roomfmGroup = new FormGroup({
      roomID: new FormControl(null),
      roomNumber: new FormControl(null, Validators.required),
      roomTypeID: new FormControl(null, Validators.required)
    });
  }

  checkRequired(controlName: string) {
    return this.roomfmGroup.controls[controlName].errors?.['required'];
  }

  resetForm() {
    this.isShowList = false;
    this.createFormGroup();
    this.roomID = null;
  }
  getroomnumber() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillRoomNo")
      .subscribe(response => {
        console.log("Facility Name:", response);
        this.lstroomnumber = response.data;
      });
  }

  getroomname() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillRoomtype")
      .subscribe(response => {
        this.lstRoomName = response.data;
      });
  }


  getroom() {
    this.baseService.GET<any>(this.URL + "TblRoom/GetAll").subscribe(response => {
      this.lstroom = response.data;
      this.totalPages = Math.ceil(this.lstroom.length / this.itemsPerPage);
      this.Paginationrecord();
      this.PageNumber();
    });
  }


  Addroom() {
    const formValues = this.roomfmGroup.getRawValue();
    console.log("Form Values Before Add:", formValues); // Debugging log

    if (this.roomfmGroup.invalid) {
      this.toastr.error('Please fill all required fields', 'Error');
      return;
    }

    this.baseService.POST(this.URL + "TblRoom/Add", this.roomfmGroup.getRawValue()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          this.getroom();
          this.roomfmGroup.reset();
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



  editroom(item: any) {
    this.roomID = item.roomID;
    this.isShowList = false;
    this.roomfmGroup.patchValue({
      roomID: item.roomID,
      roomNumber: item.roomNumber,
      roomTypeID: item.roomTypeID
    });
  }

  updateroom() {
    this.baseService.PUT(this.URL + "TblRoom/Update", this.roomfmGroup.getRawValue()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Updated');
          this.getroom();
          this.roomfmGroup.reset();
          this.roomID = null;
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



  //delete room

  onDelete(roomId: number) {
    this.baseService.DELETE(URL + "Tblroom/delete?id=" + roomId).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("DELETE Response:", response);
          this.getroomname();
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
    this.roomIdDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.roomIdDelete !== null) {
      this.onDelete(this.roomIdDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.roomIdDelete = null;
    this.showPopup = false;
  }




  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editroom(event.row),
      delete: () => this.openDeleteModal(event.row.roomId),
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
    this.paginatedList = this.lstroom.slice(startIndex, endIndex);
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




