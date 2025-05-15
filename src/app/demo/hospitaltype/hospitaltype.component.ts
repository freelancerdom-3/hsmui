/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'app-hospitaltype',
  standalone: true,
  imports: [SharedModule, PopUpComponent, DatatableComponent],

  templateUrl: './hospitaltype.component.html',
  styleUrls: ['./hospitaltype.component.scss']
})
export class hospitaltypeComponent implements OnInit {
  // Define permissions
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

  hospitallist: any[] = [];
  // PAGINATION
  paginatedList: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  itemsPerPage: number = AppConstant.RecordPerPage;
  pageNumbers: number[] = [];
  isShowList: boolean = true;
  selectedHospitalId: number | null = null;
  URL = AppConstant.url;




  // Define table headers



  showPopup = false
  hospitalTypeIDDelete: number | null = null;
  tableHeaders = [
    { label: 'HospitalType', key: 'hospitalType' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];







  constructor(
    private baseService: BaseService,
    private toastr: ToastrService,
    private permissionService: PermissionService) {
    this.permission = this.permissionService.getPermissions("HospitalType");
  }

  ngOnInit() {
    this.createFormGroup();
    this.gethospitaltypelist();
    this.actionButtons = [];
    this.setPermissions = this.permissionService.getPermissions("HospitalType");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }
  // Dynamically set permissions for buttons
  hospitalTypefmGroup: FormGroup;

  createFormGroup() {
    this.hospitalTypefmGroup = new FormGroup({
      HospitalTypeID: new FormControl(0, [Validators.required]),
      HospitalType: new FormControl(null, [Validators.required, Validators.minLength(3)])
    })
  }


  checkRequired(controlName: any) {
    return this.hospitalTypefmGroup.controls[controlName].touched && this.hospitalTypefmGroup.controls[controlName].errors?.['required'];
  }


  checkminlength(controlName: any) {
    return this.hospitalTypefmGroup.controls[controlName].touched && this.hospitalTypefmGroup.controls[controlName].errors?.['minlength']
  }

  gethospitaltypelist() {
    this.baseService.GET<any>(this.URL + "TblHospitalType/GetAll").subscribe(response => {
      this.hospitallist = response.data || [];
      this.totalRecords = this.hospitallist.length;
      this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
      this.PageNumber();
      this.Paginationrecord();
    });
  }


  addHospital() {

    this.baseService.POST(this.URL + "TblHospitalType/Add", this.hospitalTypefmGroup.getRawValue()).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("POST Response:", response);
          this.gethospitaltypelist();
          this.hospitalTypefmGroup.reset({ HospitalTypeID: 0 });
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
  editHospital(hospital: any) {
    this.selectedHospitalId = hospital.hospitalTypeID;
    this.isShowList = false;
    this.hospitalTypefmGroup.patchValue({
      HospitalTypeID: hospital.hospitalTypeID,
      HospitalType: hospital.hospitalType
    });
  }

  updateHospital() {


    this.baseService.PUT(this.URL + "TblHospitalType/Update", this.hospitalTypefmGroup.getRawValue()) // No ID in the URL
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("PUT Response:", response);
            this.gethospitaltypelist();
            this.isShowList = true;


          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to update ', 'Error');
        }
      });
  }

  onDelete(hospitalTypeID: number) {
    this.baseService.DELETE(this.URL + "TblHospitalType/Delete?id=" + hospitalTypeID).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("DELETE Response:", response);
          this.gethospitaltypelist();
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
    this.hospitalTypeIDDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.hospitalTypeIDDelete !== null) {
      this.onDelete(this.hospitalTypeIDDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.hospitalTypeIDDelete = null;
    this.showPopup = false;
  }




  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editHospital(event.row),
      delete: () => this.openDeleteModal(event.row.hospitalTypeID),
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
    this.paginatedList = this.hospitallist.slice(startIndex, endIndex);
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