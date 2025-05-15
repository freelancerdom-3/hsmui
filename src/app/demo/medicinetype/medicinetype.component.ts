/* eslint-disable no- */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule, } from '@angular/common';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';


@Component({
  selector: 'app-medicinetype',
  standalone: true,
  imports: [CommonModule, SharedModule, PopUpComponent, DatatableComponent],
  templateUrl: './medicinetype.component.html',
  styleUrls: ['./medicinetype.component.scss']
})
export class MedicineTypeComponent implements OnInit {


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
  medicinetypelist: any[] = [];
  paginatedList: any[] = []; // Paginated data
  isShowList: boolean = true;
  selectedmedicineTypeId: number | null = null;  // Store selected hospital ID for update
  http = inject(HttpClient)

  tableHeaders = [
    { label: 'MedicineType', key: 'typeName' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];



  showPopup = false
  medicineTypeIDDelete: number | null = null

  constructor(private baseService: BaseService,
    private toastr: ToastrService,
    private permissionService: PermissionService) { }

  // life cycle event
  ngOnInit() {
    this.createFormGroup();
    this.getMedicineTypes();
    this.setPermissions = this.permissionService.getPermissions("MedicineType");

    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }

  medicineTypeFormGroup: FormGroup
  // Pagination properties
  currentPage: number = 1; //currect page number
  itemsPerPage: number = AppConstant.RecordPerPage;
  totalPages: number = 0; //total page
  pageNumbers: number[] = [];//list
  URL = AppConstant.url

  createFormGroup() {

    this.medicineTypeFormGroup = new FormGroup({
      medicineTypeID: new FormControl(0, [Validators.required]),
      typeName: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),


    })
  }
  checkRequired(controlName: any) {
    return this.medicineTypeFormGroup.controls[controlName].touched && this.medicineTypeFormGroup.controls[controlName].errors?.['required'];
  }


  checkminlength(controlName: any) {
    return this.medicineTypeFormGroup.controls[controlName].touched && this.medicineTypeFormGroup.controls[controlName].errors?.['minlength'];
  }
  checkmaxlength(controlName: any) {
    return this.medicineTypeFormGroup.controls[controlName].touched && this.medicineTypeFormGroup.controls[controlName].errors?.['maxlength'];
  }

  getMedicineTypes() {
    this.baseService.GET<any>(this.URL + "TblMedicineType/GetAll").subscribe(response => {
      console.log("Get Response:", response);
      this.medicinetypelist = response.data;
      this.totalPages = Math.ceil(this.medicinetypelist.length / this.itemsPerPage); // FIX: Update total pages
      this.Paginationrecord();//update list
      this.PageNumber(); // FIX: Update page numbers
    });
  }
  add() {
    this.isShowList = false;
    this.createFormGroup();
    this.selectedmedicineTypeId = null;
  }

  AddMedicineTypes() {
    this.baseService.POST(this.URL + "TblMedicineType/Add", this.medicineTypeFormGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("POST Response:", response);
            this.getMedicineTypes();
            this.isShowList = true;
            this.medicineTypeFormGroup.reset({
              medicineTypeID: 0,
              typeName: ''
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
  editMedicineTypes(medicinetype: any) {
    this.selectedmedicineTypeId = medicinetype.medicineTypeID;
    this.isShowList = false; //showList
    this.medicineTypeFormGroup.patchValue({
      medicineTypeID: medicinetype.medicineTypeID, // ID
      typeName: medicinetype.typeName // NAME
    });
  }


  updateMedicineTypes() {

    this.baseService.PUT(this.URL + "TblMedicineType/Update", this.medicineTypeFormGroup.getRawValue())// No ID in the URL
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            this.getMedicineTypes();
            this.isShowList = true;

            // this.medicineTypeFormGroup.reset({
            //   medicineTypeID: 0,
            //   typeName: ''

            //     })
          }
          else {
            this.toastr.error(response.message, 'Error');
          }

          this.currentPage = 1;

          // this.selectedHospitalId = null;
        },
        error: () => {
          this.toastr.error('Failed to update ', 'Error');
        }

      });
  }
  onDelete(medicineTypeID: number) {
    this.baseService.DELETE(this.URL + "TblMedicineType/Delete?Id=" + medicineTypeID).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("DELETE Response:", response);
          this.getMedicineTypes();
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
    this.medicineTypeIDDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.medicineTypeIDDelete !== null) {
      this.onDelete(this.medicineTypeIDDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.medicineTypeIDDelete = null;
    this.showPopup = false;
  }



  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editMedicineTypes(event.row),
      delete: () => this.openDeleteModal(event.row.medicineTypeID),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }



  //record for the page
  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.medicinetypelist.slice(startIndex, endIndex);
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



