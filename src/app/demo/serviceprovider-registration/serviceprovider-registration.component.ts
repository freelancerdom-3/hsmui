import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { BaseService } from 'src/app/services/base.service';
import { state } from '@angular/animations';
import { Router } from '@angular/router';
@Component({
  selector: 'app-serviceprovider-registration',
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './serviceprovider-registration.component.html',
  styleUrl: './serviceprovider-registration.component.scss'
})
export class ServiceproviderRegistrationComponent implements OnInit{
userForm!: FormGroup;

constructor(private fb: FormBuilder,private baseService: BaseService,private router:Router) {}
isSubmitting = false;
showSkillPopup = false; 
availableSkills: any[] = [];
selectedSkillIds: number[] = [];
showError = false;
selectedstateData: any = null;
stateResult: any[] = [];
stateName: string = '';
cityResult: any[] = [];
selectedCityData: any = null;
cityName: string = '';
  showAriaPopup = false;
  selectedAriaIds: number[] = [];
  ariaError = false;
  availableArias: any[] =[];
savedAreaIds: number []=[];


  user = {
    userId: localStorage.getItem('userId')   ,
    mobileNumber: localStorage.getItem('mobileNumber'),
    fullName:'',
    email:'',
    gender:'',
    dateOfBirth:'',
    ariaName:'',
    skill:'',
    
  };
 


ngOnInit() {
  
  this.userForm = this.fb.group({
      

    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', Validators.required],
    dateOfBirth: ['', [Validators.required, this.minimumAgeValidator(18)]],
    State: ['', Validators.required],
  City: [{ value: '', disabled: true }, Validators.required], // initially disabled
  arias: [[]],
  skills: [[]]
  
  });

  this.baseService.GET<any>("https://localhost:7282/api/SubCategory/GetAllSkill")
       .subscribe(response => {
        console.log(' details ', response);
        this.availableSkills = response.data;
      });
}

toggleSkillPopup() {
  this.showSkillPopup = true;
  this.showError = false;
}

toggleSkill(skillId: number) {
  const index = this.selectedSkillIds.indexOf(skillId);
  if (index > -1) {
    this.selectedSkillIds.splice(index, 1);
  } else {
    if (this.selectedSkillIds.length < 3) {
      this.selectedSkillIds.push(skillId);
    }
  }
}

isSelected(skillId: number): boolean {
  return this.selectedSkillIds.includes(skillId);
}

getSelectedSkillNames(): string {
  return this.availableSkills
    .filter(skill => this.selectedSkillIds.includes(skill.subCategoryId))
    .map(skill => skill.subCategoryName)
    .join(', ');
}

saveSkills() {
  if (this.selectedSkillIds.length === 0) {
    this.showError = true;
    return;
  }
  this.userForm.get('skill')?.setValue(this.selectedSkillIds);

  this.showSkillPopup = false;
}

minimumAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const dob = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    if (
      age < minAge ||
      (age === minAge && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))
    ) {
      return { underage: true };
    }
    return null;
  };
}

onSubmit() {

 // if (this.userForm.invalid || this.selectedSkillIds.length === 0 || this.selectedAriaIds.length === 0) return;
if (this.userForm.valid && this.selectedSkillIds.length > 0 && this.selectedAriaIds.length > 0) {
      console.log('Form submitted:', this.userForm.value);

      // Optionally: Save form data in localStorage
      localStorage.setItem('formData', JSON.stringify(this.userForm.value));

      // Navigate to login-serviceprovider component
      this.router.navigate(['/login-serviceprovider']);
    } else {
      console.log('Form is invalid or selections missing');
    }
  
  this.isSubmitting = true;


  // Your logic here...

  this.isSubmitting = false;

  if (this.userForm.valid) {
    const updatedUser = {
      userId: localStorage.getItem('userId'),
      mobileNumber: localStorage.getItem('mobileNumber'),
      fullName: this.userForm.value.fullName,
      email: this.userForm.value.email,
      gender: this.userForm.value.gender,
      dateOfBirth: this.userForm.value.dateOfBirth,
      state: this.userForm.value.state,
      city:this.userForm.value.city,
      
      ariaName: this.userForm.value.ariaName,
    };

    console.log("Submitting user", updatedUser);

    this.baseService.PUT<any>("https://localhost:7282/api/User", updatedUser)
      .subscribe(response => {
        console.log('User updated successfully', response);
      });
  } else {
    console.log('Form Invalid');
    return; // stop execution if form is invalid
  }

  // Fixing second API payload
  const skillPayload = {
    userId: Number(localStorage.getItem('userId')),
    skillIDList: this.selectedSkillIds.map(Number) // backend might expect "skills" or similar
  };

  console.log("Submitting skills", skillPayload);

  this.baseService.POST<any>("https://localhost:7282/api/ServiceProviderSubCategoryMapping", skillPayload)
    .subscribe({
      next: (response) => {
        console.log('Skills updated successfully', response);
      },
      error: (error) => {
        console.error('Error updating skills:', error);
      }
    });



//Aria Mapping API
     const AriaPayload = {
    userId: Number(localStorage.getItem('userId')),
    AriaListID: this.selectedAriaIds.map(Number) 
  };

  console.log("Submitting Arias", AriaPayload);

  this.baseService.POST<any>("https://localhost:7282/api/ServiceProviderAreaMapping/PostbyAriaMapping", AriaPayload)
    .subscribe({
      next: (response) => {
        console.log('Aria updated successfully', response);
      },
      error: (error) => {
        console.error('Error updating skills:', error);
      }
    });

    


     
}
searchStateData(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;
  let regionName = input.value.trim();
  const onlyAlphabets = /^[a-zA-Z]$/.test(event.key);

  if (regionName.length == 0) {
    this.stateResult = [];
    this.selectedstateData = null;
    // ✅ CLEAR CITY WHEN STATE IS CLEARED
    this.cityResult = [];
    this.selectedCityData = null;
    this.cityName = '';
    this.userForm.get('City')?.reset();     // <-- reset form control
    this.userForm.get('City')?.disable();   // <-- disable city input again
    this.isAreaButtonEnabled = false;       // <-- also disable area button
    return;
  }

  if (event.key.length == 1 && onlyAlphabets && regionName.length >= 2) {
    console.log("Keyboard event :", event.key);
    console.log("Input data :", regionName);

    this.baseService.GET<any>("https://localhost:7282/api/RegionSearch/GetByState?StateName=" + regionName)
      .subscribe(response => {
        console.log('State selected successfully:', response);
        this.stateResult = response.data;
        console.log("Search result :", JSON.stringify(response.data).toString());
        console.log("State Id from search : "+response.data[0].regionID);
      });
  }
}
selectState(state):void {
  console.log("select state"+state.regionName);
  //this.userForm.get('State')?.setValue(state.regionName);
  this.stateName = state.regionName;
  this.selectedstateData = state;
  this.stateResult = [];
  console.log("State ID from search after select : "+state.regionID);
  localStorage.setItem('StateIDFromSearch', String(state.regionID));
   // Enable city input
  this.userForm.get('City')?.enable();
}


isSkillButtonEnabled = false;
isAreaButtonEnabled = false;


searchCityData(event: KeyboardEvent) {
  //Get stateID first from localstorage 
  const stateIDFromSearch = localStorage.getItem('StateIDFromSearch');
  const input = event.target as HTMLInputElement;
  let cityName = input.value.trim();
  const onlyAlphabets = /^[a-zA-Z]$/.test(event.key);

  // if (cityName.length === 0) {
  //   this.cityResult = [];
  //   this.selectedCityData = null;
  //   return;
  // }

  if (event.key.length === 1 && onlyAlphabets && cityName.length >= 3) {
      console.log("Keyboard event :", event.key);
    console.log("Input data :", cityName);
    this.baseService.GET<any>("https://localhost:7282/api/RegionSearch/GetByCity?StateId="+stateIDFromSearch+"&CityName="+cityName
    ).subscribe(response => {
      this.cityResult = response.data;
      console.log("City data from search : "+JSON.stringify(response.data).toString());
    });
  }
}

selectCityAndSaveToLocalStorage(city: any): void {
  console.log("Selected city:", city.regionName);
  console.log("City ID:", city.regionID);

  this.cityName = city.regionName;
  this.selectedCityData = city;
  this.cityResult = [];
  localStorage.setItem('CityIDFromSearch', String(city.regionID));
   // ✅ Enable Area button
  this.isAreaButtonEnabled = true;

   this.selectedAriaIds = [];
  this.availableArias = [];
  this.ariaError = false;
  this.userForm.get('regionName')?.setValue([]);
}



  selectAreas(){
    const CityIDFromSearch = localStorage.getItem('CityIDFromSearch');
     this.baseService.GET<any>("https://localhost:7282/api/RegionSearch/GetByArea?CityId=" + CityIDFromSearch
    ).subscribe(response => {
      this.availableArias = response.data;
      console.log("Area data from search : "+JSON.stringify(response.data).toString());
    });
  }


  toggleAriaPopup() {
    this.showAriaPopup =  !this.showAriaPopup;;
    this.ariaError = false;
    this.selectAreas();
  }

 toggleAria(id: number) {
  const index = this.selectedAriaIds.indexOf(id);
  if (index > -1) {
    // If already selected, remove it (unselect)
    this.selectedAriaIds.splice(index, 1);
  } else {
    // Add without any limit
    this.selectedAriaIds.push(id);
  }
}


  isAriaSelected(id: number): boolean {
    return this.selectedAriaIds.includes(id);
  }

  saveAria() {
    if (this.selectedAriaIds.length === 0) {
      this.ariaError = true;
      return;
    }
    this.userForm.get('regionName')?.setValue(this.selectedAriaIds);

    this.showAriaPopup = false;
    this.ariaError = false;
    console.log("Seleced Area ids : "+this.selectedAriaIds);
  // ✅ Enable Skill button
  this.isSkillButtonEnabled = true;
  }

  getSelectedAriaNames(): string {
    return this.availableArias
      .filter(item => this.selectedAriaIds.includes(item.regionID))
      .map(item => item.regionName)
      .join(', ');
  }
  

navigateTOloginserviceprovider(){
    this.router.navigate(['login-serviceprovider']);
  }
}
