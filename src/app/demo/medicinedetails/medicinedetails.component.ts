import { Component,inject,OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule, NgIfContext } from '@angular/common';
import { AppConstant } from '../baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { Router, RouterModule } from '@angular/router';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import { PermissionService } from 'src/app/services/permission.service';




@Component({
  selector: 'app-medicinedetails',
  standalone: true,
  imports: [SharedModule,CommonModule,RouterModule,PopUpComponent, DatatableComponent],
  templateUrl: './medicinedetails.component.html',
  styleUrls: ['./medicinedetails.component.scss']

})
export class medicinedetails implements OnInit{
  submitForm() {
    throw new Error('Method not implemented.');
    }
      setPermissions: any;
      canAdd: boolean = false;
      canEdit: boolean = false;
      canDelete: boolean = false;
      canView : boolean = false;
      permission :any;
	  actionButtons = [];

  medicinedetailslist:any[]=[];
  isShowList:boolean=true;
 // medicineDetailsID: number | null = null;
  selectedMedicineID: number | null = null;
  medicinetypelist:any []=[];
  diseaselist:any []=[];
  paginatedList: any[] = [];
  treatmentdetailsidwithnamelist:any[]=[];
   // Paginated data
  URL=AppConstant.url
  // selected  // Store selected hospital ID for update

  tableHeaders = [
    { label: 'Medicine', key: 'typeName' },
    { label: 'DieseaseName', key: 'dieseaseName' },
    { label: 'Dosage', key: 'dosage' },
    { label: 'Frequency', key: 'frequency' },
    { label: 'Duration', key: 'duration' },
    { label: 'Instruction', key: 'instruction' },
    { label: 'Issue Date', key: 'issueDateTime' },
    { label: 'Created By', key: 'createdBy' },
    { label: 'Created On', key: 'createdOn' },
    { label: 'Updated By', key: 'updatedBy' },
    { label: 'Updated On', key: 'updatedOn' },
    { label: 'Is Active', key: 'isActive' }
  ];




  constructor
  (
  private baseService: BaseService,
  private toastr: ToastrService,
   private router: Router,
   private permissionService: PermissionService
  )
  {
    this.permission = this.permissionService.getPermissions("MedicineDetails");
  }
  // medicinetypepost:any={
  //   "createBy":0,
  //   "cretedOn":"",
  //   "updateBy":0,
  //   "updateOn":"",
  //   "isActive": true,
  //   "versionNo":0,
  //   "medicineTypeID":0,
  //   "typeName":"",
  // // }
  // http=inject(HttpClient)

  showPopup = false
  medicineDetailsIDDelete: number | null = null;


  //constructor(private baseService: BaseService,private toastr: ToastrService, private router: Router) {}


  // life cycle event
  ngOnInit() {
     this.createFormGroup();
     this.getmedicinedetails();
     this.getmedicinetype();
     this.gettreatmentdetailsidwithname();
     this.setPermissions = this.permissionService.getPermissions("MedicineDetails");

    }

    medicinedetailsFormGroup:FormGroup
    // Pagination properties
    currentPage: number = 1; //currect page number
    itemsPerPage: number =AppConstant.RecordPerPage; //total data in page
    totalPages: number = 0; //total page
    pageNumbers: number[] = [];//list

    createFormGroup(){

      this.medicinedetailsFormGroup= new FormGroup({
        medicinedetailsID:new FormControl(0,[Validators.required]),
        treatmentDetailsId :new FormControl(null,[Validators.required]),
        medicineTypeID:new FormControl(0,[Validators.required]),
        dosage :new FormControl(''),
        frequency :new FormControl(''),
        duration:new FormControl(''),
        instruction:new FormControl(''),
        issudate:new FormControl(''),


      })
    }
    checkRequired(controlName:any)
    {
      return this.medicinedetailsFormGroup.controls[controlName].touched && this.medicinedetailsFormGroup.controls[controlName].errors?.['required'];
    }


    checkminlength(controlName:any)
    {
       return this.medicinedetailsFormGroup.controls[controlName].errors?.['minlength'];
    }

    getmedicinedetails(){
    this.baseService.GET <any>(this.URL+"TblMedicineDetails/GetAll").subscribe(response=>{
      console.log("Get Response:", response);
      this. medicinedetailslist = response.data;
      this.totalPages = Math.ceil(this.medicinedetailslist.length / this.itemsPerPage); // FIX: Update total pages
    this. Paginationrecord();//update list
     this.PageNumber(); // FIX: Update page numbers
    });
}
add(){
  this.isShowList =false;
  this.createFormGroup();
  this.selectedMedicineID=null;
}


Addmedicinedetails(){

    //Medicine:any [] = [];
    this.baseService.POST(this.URL+"TblMedicineDetails/Add",this.medicinedetailsFormGroup.getRawValue())
      .subscribe({
        next:(response:any)=> {
        if(response.statusCode === 200){
          this.toastr.success(response.message,'Success');
        console.log("POST Response:", response);
        this.getmedicinedetails();
        this.isShowList = true;
        this.medicinedetailsFormGroup.reset({ });
      }
      else{
        this.toastr.error(response.message,'Error');
      }},
      error:()=>{
        this.toastr.error('Failed to Add','Error');
      }


  //  this.currentPage = 1;
    });

  }

  editmedicinedetails(medicinedetails: any) {
    this.selectedMedicineID = medicinedetails.medicineDetailsID;
    this.isShowList = false; //showList

    this.medicinedetailsFormGroup.patchValue({
      medicinedetailsID: medicinedetails.medicineDetailsID, // Correct patching for the ID
      treatmentDetailsId: medicinedetails.treatmentDetailsId,
      medicineTypeID: medicinedetails.medicineTypeID,
        dosage: medicinedetails.dosage,
        frequency: medicinedetails.frequency,
        duration: medicinedetails.duration,
        instruction: medicinedetails.instruction,
        issudate: medicinedetails.issudate

    //  medicinedetailsID:medicinedetails.medicineTypeID, // ID
    //   medicinetypeId: medicinedetails. medicinetypeId ,
    //   treatmentdetailsId:medicinedetails.treatmentdetailsId// NAME
    //   treatmentdetailsId: medicinedetails.treatmentdetailsId,
    //   medicinetypeID: medicinedetails.medicineTypeID,
    //   dosage: medicinedetails.dosage,
    //   frequency: medicinedetails.frequency,
    //   duration: medicinedetails.duration,
    //   instruction: medicinedetails.instruction,
    //   issudate: medicinedetails.issueDateTime,




    });
  }


  updatemedicinedetails() {
    this.baseService.PUT(this.URL+"TblMedicineDetails/Update",this.medicinedetailsFormGroup.getRawValue())// No ID in the URL
      .subscribe({
        next:( response:any )=>  {
        if (response.statusCode ===200){
        this.toastr.success(response.message,'Success');
          console.log("PUT Response:", response);
          this. getmedicinedetails();
          this.isShowList = true;
          // this.selectedMedicineID=null


          this.medicinedetailsFormGroup.reset({
            medicinedetailsID: 0,
            treatmentdetailsId: 0,
            medicineTypeID: 0,
            dosage: '',
            frequency: '',
            duration: '',
            instruction: '',
            issudate: ''
          });
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
    onDelete(medicineDetailsID: number){
      this.baseService.DELETE(this.URL+"TblMedicineDetails/Delete?ID=" + medicineDetailsID).subscribe({
        next:(response:any)=> {
          if(response.statusCode===200){
            this.toastr.success(response.message,'Success');
        console.log("DELETE Response:", response);
        this. getmedicinedetails();
        this.isShowList = true;
          }
          else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: () => {
          this.toastr.error('Failed to Delete', 'Error');
        }
      });
    }
// getmedicinetype(){
//   this.baseService.GET<any>("https://localhost:7272/api/GetDropDownList/FillMedicineTypeName").subscribe(response =>{
//     console.log("get response:",response);
//     this.medicinedetailslist =response.data;
//   });
// }
getmedicinetype() {
  this.baseService.GET<any>(this.URL+"GetDropDownList/FillMedicineTypeName").subscribe(response => {
    console.log("Get response:", response);
    this.medicinetypelist=response.data;

  });
}
//  getdisease() {
//   this.baseService.GET<any>("https://localhost:7272/api/GetDropDownList/FillDiseaseName").subscribe(response => {
//     console.log("Get response:", response);
//     // Assuming response.data contains an array of items
//     if (response.data) {
//       this.diseaselist = response.data; // Populate dropdown list with fetched data
//     } else {
//       console.error("No data found in the response!");
//     }
//   });
// }
gettreatmentdetailsidwithname(){
  this.baseService.GET<any>(this.URL+"GetDropDownList/FillTreatmentCode").subscribe(response => {
    console.log("GET Response:", response);
    this.treatmentdetailsidwithnamelist = response.data;
    console.log("treamentdetailslistwithname", this.treatmentdetailsidwithnamelist);
  })
}


onTableAction(event: { action: string; row: any }) {
  const actionHandlers: { [key: string]: () => void } = {
    edit: () => this.editmedicinedetails(event.row),
    delete: () => this.openDeleteModal(event.row.medicineDetailsID),
    bill: () => this.router.navigate(['/billing', event.row.treatmentDetailsId]),
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
  this.paginatedList = this.medicinedetailslist.slice(startIndex, endIndex);
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
    this. Paginationrecord();
  }
}


openDeleteModal(id: number) {
  this.medicineDetailsIDDelete = id;
  this.showPopup = true;
}

confirmDelete() {
  if (this.medicineDetailsIDDelete !== null) {
    this.onDelete(this.medicineDetailsIDDelete);
  }
  this.cleanupPopup();
}


cancelDelete() {
  this.cleanupPopup();
}

// hide the modal  and reset the ID
private cleanupPopup() {
  this.medicineDetailsIDDelete = null;
  this.showPopup = false;
}




}



