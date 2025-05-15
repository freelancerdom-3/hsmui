/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';

@Component({

  selector: 'app-Role',
  standalone: true,
  imports: [CommonModule, SharedModule, DatatableComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
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
  getPermissions: any;
  //actionButtons = ['perm'];

  lstrole: any[] = [];
  Roles: any[] = [];
  isShowList: boolean = true;
  selectedroleId: number | null = null;
  rolesfmGroup: FormGroup;
  currentPage: number = 1;
  itemsPerPage: number = AppConstant.RecordPerPage;
  totalPages: number = 0;
  pageNumbers: number[] = [];
  URL = AppConstant.url

  tableHeaders = [
    { label: 'RoleName', key: 'roleName' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];



  roleData: any
  constructor
    (
      private baseService: BaseService,
      private toastr: ToastrService,
      private permissionService: PermissionService
    ) {
    this.permission = this.permissionService.getPermissions("Role");
  }

  ngOnInit() {
    this.createFormGroup();
    this.getRoles();
    this.setPermissions = this.permissionService.getPermissions("Role");
    //this.setPermissions.actionButtons = [this.getPermissions.isEdit];
    //this.actionButtons = [this.getPermissions.isEdit];
    this.actionButtons = [];

    if (this.setPermissions.isEdit === true) {
      this.actionButtons.push("edit");
    }
  }


  resetForm() {
    this.isShowList = false;
    this.createFormGroup();
    this.selectedroleId = null;
  }

  createFormGroup() {
    this.rolesfmGroup = new FormGroup({
      roleId: new FormControl(0, [Validators.required]),
      rolename: new FormControl(null, [Validators.required, Validators.minLength(3)]),
    });
  }

  checkRequired(controlName: any) {
    return this.rolesfmGroup.controls[controlName].errors?.['required'];
  }

  // Pagination logic
  Rolerecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.Roles = this.lstrole.slice(startIndex, endIndex);
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
      this.Rolerecord();
    }
  }

  getRoles() {
    this.baseService.GET<any>(this.URL + "TblRole/GetAll").subscribe(response => {
      this.lstrole = response.data;
      this.totalPages = Math.ceil(this.lstrole.length / this.itemsPerPage);
      this.Rolerecord();
      this.PageNumber();
    });
  }

  AddRoles() {
    this.baseService.POST(this.URL + "TblRole/Add", this.rolesfmGroup.getRawValue())
      .subscribe({
        next: (response: any) => { // No need for ': any'
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("POST Response:", response);
            this.getRoles();
            this.isShowList = true;
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to add role', 'Error');
        }
      });
  }


  editRole(role: any) {
    this.selectedroleId = role.roleId;
    this.isShowList = false;
    this.rolesfmGroup.patchValue({
      roleId: role.roleId,
      rolename: role.roleName
    });
  }

  updateRole() {


    this.baseService.PUT(this.URL + "TblRole/Update", this.rolesfmGroup.getRawValue()) // No ID in the This.URL
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            console.log("PUT Response:", response);
            this.getRoles();
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

  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      edit: () => this.editRole(event.row),
      //delete: () => this.onDeletepatient(event.row.pateintDoctormappingId),
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }


}
