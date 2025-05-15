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
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';


@Component({
  selector: 'app-roomtypeess',
  standalone: true,
  imports: [SharedModule, DatatableComponent],
  templateUrl: './medicinedieseasemapping.component.html',
  styleUrls: ['./medicinedieseasemapping.component.scss']
})
export class medicinedieseasemapping implements OnInit {
  medicinetype: any;
  medicinediseaseID: any;

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

  lstmedicinedieseasemapping: any[] = [];
  paginatedList: any[] = [];
  isShowList: boolean = true;
  lstdiseasename: any[] = [];
  lstmedicinename: any[] = [];
  selectedmedicinediseaseID: number | null = null;
  diseaselist: any[] = [];
  medicinedieseasemappingfmGroup: FormGroup;

  // Page NAvigation
  currentPage: number = 1; //currect page number
  itemsPerPage: number = 5; //total data in page
  totalPages: number = 0; //total page
  pageNumbers: number[] = [];//list
  URL = AppConstant.url

  tableHeaders = [
    { label: 'MedicineName', key: 'typeName' },
    { label: ' DieseaseName', key: 'dieseaseName' },
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
    this.permission = this.permissionService.getPermissions("MedicineDisease");
  }

  ngOnInit() {
    this.createFormGroup();
    this.getdisease();
    this.getmedicinetypename();
    this.getmedicinedieseasemapping();
    this.setPermissions = this.permissionService.getPermissions("MedicineDisease");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }



  createFormGroup() {

    this.medicinedieseasemappingfmGroup = new FormGroup({
      medicineDiseaseMappingID: new FormControl(0),
      dieseaseTypeID: new FormControl(null, [Validators.required]),
      medicineTypeID: new FormControl(null, Validators.required),

    });

  }



  checkRequired(controlName: any) {
    return this.medicinedieseasemappingfmGroup.controls[controlName].errors?.['required'];
  }


  checkminlength(controlName: any) {
    return this.medicinedieseasemappingfmGroup.controls[controlName].errors?.['minlength']
  }




  //get medicinetypename
  getmedicinetypename() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillMedicineTypeName")
      .subscribe(response => {
        console.log("Medicine Type Response:", response); // Debugging log
        this.lstmedicinename = response.data;
      });
  }


  //get diseasename

  getdisease() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillDiseaseName").subscribe(response => {
      console.log("GET Response:", response);
      this.diseaselist = response.data;
      console.log("disease", this.diseaselist);
    })
  }


  //get medicinedieseasemapping


  getmedicinedieseasemapping() {

    this.baseService.GET<any>(this.URL + "TblMedicineDiseaseMapping/GetAll").subscribe(response => {
      console.log("GET Response:", response);
      this.lstmedicinedieseasemapping = response.data;
      this.totalPages = Math.ceil(this.lstmedicinedieseasemapping.length / this.itemsPerPage);
      this.Paginationrecord();
      this.PageNumber();
    });
  }


  //add medicinedieseasemapping

  Addmedicinedieseasemapping() {

    // console.log(this.roomtypefacilitymappingfmGroup.getRawValue())
    this.baseService.POST(this.URL + "TblMedicineDiseaseMapping/Add", this.medicinedieseasemappingfmGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            this.getmedicinedieseasemapping();
            this.Paginationrecord();
            this.isShowList = true;
            this.medicinedieseasemappingfmGroup.reset();
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to Add', 'Error');
        }

      });
  }



  //edit medicinedieseasemapping

  editmedicinedieseasemapping(item: any) {
    this.medicinediseaseID = item.medicinediseaseID;
    this.isShowList = false;
    this.medicinedieseasemappingfmGroup.patchValue({
      medicinediseaseid: item.medicinediseaseID,
      dieseaseTypeID: item.dieseaseTypeID,
      medicineTypeID: item.medicineTypeID
    });
  }

  //update medicinedieseasemapping

  updatemedicinedieseasemapping() {
    this.baseService.PUT(this.URL + "TblMedicineDiseaseMapping/Update", this.medicinedieseasemappingfmGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("PUT Response", response)
            this.getmedicinedieseasemapping();
            this.isShowList = true;
            this.medicinediseaseID = null;
            this.medicinedieseasemappingfmGroup.reset();
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to Update', 'Error');
        }

      });
  }



  //delete medicinedieseasemapping

  // onDelete(id: number) {
  //   this.baseService.DELETE(this.URL + "TblMedicineDiseaseMapping/DeleteByID?Id=" + id)
  //     .subscribe(response => {
  //       if (response.statusCode === 200) {
  //       this.toastr.success("Deleted successfully");
  //       this.getmedicinedieseasemapping();
  //     });

  // }
  onDelete(medicineDiseaseMappingID: number) {

    this.baseService.DELETE(this.URL + "TblMedicineDiseaseMapping/DeleteByID?Id=" + medicineDiseaseMappingID)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("DELETE Response:", response);
            this.getmedicinedieseasemapping();
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



  //PAGINATION STOP
  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.lstmedicinedieseasemapping.slice(startIndex, endIndex);
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
      edit: () => this.editmedicinedieseasemapping(event.row),
      delete: () => this.onDelete(event.row.medicineDiseaseMappingID),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }

}

