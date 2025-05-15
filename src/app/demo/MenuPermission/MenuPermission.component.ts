/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable no- */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from 'src/app/translate.pipe';

@Component({
  selector: 'app-hospitaltype',
  standalone: true,
  imports: [SharedModule,TranslatePipe],
  templateUrl: './MenuPermission.component.html',
  styleUrls: ['./MenuPermission.component.scss']
})
export class MenuPermission implements OnInit {
  TblMenuPermissionlist: any[] = [];
  MenuPermissionlist: any[] = [];
  selectedRoleId: number | null = null;

  formChanged: boolean = false;
  selectedHospitalId: number | null = null;
  URL = AppConstant.url;



  constructor(private baseService: BaseService, private toastr: ToastrService) { }

  ngOnInit() {
    this.getMenuPermissionlist();
    this.getrolename()
  }

  // Submit all menu permissions to backend
  submitMenuPermissions() {
    this.baseService.POST(this.URL + "TblMenuPermission/Add", this.TblMenuPermissionlist)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message, 'Success');
            this.formChanged = false; // for submit button
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to submit menu permissions', 'Error');
        }
      });
  }

  getrolename() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillRoles").subscribe(response => {
      console.log("GET Response:", response);
      this.MenuPermissionlist = response.data;
      this.selectedRoleId = this.MenuPermissionlist[0]?.id;
      this.getMenuPermissionlist();
    })
  }

  getMenuPermissionlist() {
    const roleIdParam = this.selectedRoleId ? `?roleId=${this.selectedRoleId}` : '';
    this.baseService.GET<any>(`${this.URL}TblMenuPermission/GetAll${roleIdParam}`)
      .subscribe(response => {
        this.TblMenuPermissionlist = response.data || [];
      });
  }

  onCheckboxChange(item: any, field: string) {
    this.formChanged = true; // for submit
    const updatePayload = {
      menuRoleMappingID: item.menuRoleMappingID,
      roleID: item.roleID,
      menuID: item.menuID,
      [field]: item[field],
      isEdit: item.isEdit,
      isAdd: item.isAdd,
      isDelete: item.isDelete,
      isView: item.isView
    };
  }
}
