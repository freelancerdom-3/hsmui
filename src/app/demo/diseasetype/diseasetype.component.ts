import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule, NgIfContext } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';




@Component({
  selector: 'app-diseasetype',
  standalone: true,
  imports: [CommonModule, SharedModule, PopUpComponent, DatatableComponent],
  templateUrl: './diseasetype.component.html',
  styleUrls: ['./diseasetype.component.scss']
})
export class DiseaseTypeComponent implements OnInit {
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

  diseasetypelist: any[] = [];
  paginatedList: any[] = []; // Paginated data
  isShowList: boolean = true;
  selecteddieseaseTypeID: number | null = null;  // Store selected hospital ID for update


  http = inject(HttpClient)

  tableHeaders = [
    { label: 'DieseaseName', key: 'dieseaseName' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];



  showPopup = false;
  dieseaseTypeIDDelete: number | null = null;
  // Define permissions



  constructor
    (
      private baseService: BaseService,
      private toastr: ToastrService,
      private permissionService: PermissionService
    ) {
    this.permission = this.permissionService.getPermissions("DiseaseType");
  }

  // life cycle event
  ngOnInit() {
    this.createFormGroup();
    this.getDieseaseTypes();
    this.setPermissions = this.permissionService.getPermissions("DiseaseType");
    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }

    if (this.setPermissions.isDelete === true) {
      this.actionButtons.push("delete");
    }
  }

  dieseaseTypeFormGroup: FormGroup
  // Pagination properties
  currentPage: number = 1; //currect page number
  itemsPerPage: number = 5; //total data in page
  totalPages: number = 0; //total page
  pageNumbers: number[] = [];//list

  createFormGroup() {

    this.dieseaseTypeFormGroup = new FormGroup({
      dieseaseTypeID: new FormControl(0, [Validators.required]),
      dieseaseName: new FormControl(null, [Validators.required, Validators.minLength(3)]),


    })
  }
  checkRequired(controlName: any) {
    return this.dieseaseTypeFormGroup.controls[controlName].touched && this.dieseaseTypeFormGroup.controls[controlName].errors?.['required'];
  }


  checkminlength(controlName: any) {
    return this.dieseaseTypeFormGroup.controls[controlName].errors?.['minlength'];
  }

  getDieseaseTypes() {
    this.baseService.GET<any>("https://localhost:7272/api/Disease/GetAll").subscribe(response => {
      console.log("Get Response:", response);
      this.diseasetypelist = response.data;
      this.totalPages = Math.ceil(this.diseasetypelist.length / this.itemsPerPage); // FIX: Update total pages
      this.Paginationrecord();//update list
      this.PageNumber(); // FIX: Update page numbers
    });
  }
  add() {
    this.isShowList = false;
    this.createFormGroup();
    this.selecteddieseaseTypeID = null;
  }
  AddDieseaseTypes() {

    //Medicine:any [] = [];


    this.baseService.POST("https://localhost:7272/api/Disease/Add", this.dieseaseTypeFormGroup.getRawValue())
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("POST Response:", response);
            this.getDieseaseTypes();
            this.isShowList = true;

            this.dieseaseTypeFormGroup.reset({
              dieseaseTypeID: 0,
              dieseaseName: ''

            });
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
          this.currentPage = 1;
        },

        //  this.currentPage = 1;
        error: () => {
          this.toastr.error('Failed to update ', 'Error');
        }

      });

  }
  editdieseaseTypes(dieseaseType: any) {
    this.selecteddieseaseTypeID = dieseaseType.dieseaseTypeID;
    this.isShowList = false; //showList
    this.dieseaseTypeFormGroup.patchValue({
      dieseaseTypeID: dieseaseType.dieseaseTypeID, // ID
      dieseaseName: dieseaseType.dieseaseName // NAME
    });
  }


  updatedieseaseTypes() {
    this.baseService.PUT("https://localhost:7272/api/Disease/Update", this.dieseaseTypeFormGroup.getRawValue())// No ID in the URL
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("PUT Response:", response);
            this.getDieseaseTypes();
            this.isShowList = true;

            this.dieseaseTypeFormGroup.reset({
              dieseaseTypeID: 0,
              dieseaseName: ''
            });
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to update ', 'Error');
        }
      });
  }


  //this.currentPage = 1;

  // this.selectedHospitalId = null;
  //     },

  //   });
  // }
  onDelete(dieseaseTypeID: number) {
    this.baseService.DELETE("https://localhost:7272/api/Disease/deleteByID?id=" + dieseaseTypeID).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          console.log("DELETE Response:", response);
          this.getDieseaseTypes();
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

  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editdieseaseTypes(event.row),
      delete: () => this.openDeleteModal(event.row.dieseaseTypeID),
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
    this.paginatedList = this.diseasetypelist.slice(startIndex, endIndex);
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


  openDeleteModal(id: number) {
    this.dieseaseTypeIDDelete = id;
    this.showPopup = true;
  }

  confirmDelete() {
    if (this.dieseaseTypeIDDelete !== null) {
      this.onDelete(this.dieseaseTypeIDDelete);
    }
    this.cleanupPopup();
  }


  cancelDelete() {
    this.cleanupPopup();
  }

  // hide the modal  and reset the ID 
  private cleanupPopup() {
    this.dieseaseTypeIDDelete = null;
    this.showPopup = false;
  }

}



