import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { PopUpComponent } from 'src/app/Common/pop-up/pop-up.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TranslationService } from 'src/app/translate.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { lastValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

interface ProfileImageResponse {
  imagePath: string;
}

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, PopUpComponent],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit {
  userName: string = '';
  profileImage: string = '/default-profile.png';
  showLogoutPopup = false;
  isLoading = false;
  
  private readonly apiUrl = 'https://localhost:7272/api';
  private readonly jwtHelper = new JwtHelperService();
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly translationService = inject(TranslationService);
  private readonly api = 'https://localhost:7272';
  private readonly cdr = inject(ChangeDetectorRef);

  languages = [
    { code: 'EK', label: 'English' },
    { code: 'GK', label: 'ગુજરાતી' },
    { code: 'HK', label: 'हिन्दी' }
  ];
  selectedLang = 'EK';

  constructor() {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
    this.loadUserData();
  }  

  async ngOnInit(): Promise<void> {
    await this.initializeLanguage();
     const token = this.getAuthToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
        this.loadUserData();         
        await this.loadProfileImage();
  } else {
    console.warn('Token not available or expired');
  }
  }

  private async initializeLanguage(): Promise<void> {
    const storedLang = localStorage.getItem('selectedLang');
    if (storedLang) {
      this.selectedLang = storedLang;
    }
    await this.translationService.load(this.selectedLang);
  }

  private getAuthToken(): string | null {
  try {
    const userData = localStorage.getItem('data'); 
    if (!userData) {
      return null;
    }
    const parsedData = JSON.parse(userData);
    console.log('Parsed data:', parsedData);
     return parsedData?.data 
    if (parsedData && parsedData.token) {
        return parsedData.token;
    } else {
        return null;
    }
  } catch (e) {
    console.error('Token parsing error:', e);
    return null;
  }
}

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private loadUserData(): void {
    try {
      const userData = localStorage.getItem('data');
      if (userData) {
        const parsedData = JSON.parse(userData);
        this.userName = parsedData?.useName || '';
        this.profileImage =  parsedData?.profileImage || this.profileImage;
      }
    } catch (e) {
      console.error('Error parsing user data', e);
    }
  }

  changeLanguage(langCode: string): void {
    this.selectedLang = langCode;
    localStorage.setItem('selectedLang', langCode);
    this.translationService.load(langCode);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    input.value = ''; 

    if (!this.validateImageFile(file)) return;

    this.uploadProfileImage(file);
  }

  private validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!validTypes.includes(file.type)) {
      alert('Only JPG, PNG, or GIF images are allowed');
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return false;
    }

    return true;
  }

  private uploadProfileImage(file: File): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.getAuthHeaders();

    this.http.post<ApiResponse<ProfileImageResponse>>(
      `${this.apiUrl}/TblUser/UploadProfileImage`, 
      formData, 
      { headers }
    ).subscribe({
      next: (response) => this.handleUploadSuccess(response),
      error: (err) => this.handleUploadError(err),
      complete: () => this.isLoading = false
    });
  }

 private handleUploadSuccess(response: ApiResponse<ProfileImageResponse>): void {
  if (response?.data?.imagePath) {
    this.updateProfileImage(response.data.imagePath);
    this.cdr.detectChanges(); // Force change detection
  }
}

  private handleUploadError(error: any): void {
    console.error('Upload failed:', error);
    const errorMessage = error.error?.message || 
                        error.message || 
                        'Failed to upload profile image';
    alert(errorMessage);
  }

private updateProfileImage(imagePath: string): void {
  // First clear the existing image
  this.profileImage = '/default-profile.png';
  
  // Small delay to ensure the clear takes effect
  setTimeout(() => {
    const fullImagePath = imagePath.startsWith('http') ? 
                       imagePath : 
                       `${this.api}${imagePath}`;
    // Add cache buster
    this.profileImage = `${fullImagePath}?t=${new Date().getTime()}`;
    this.updateLocalStorageImage(fullImagePath);
  }, 100);
}

  private updateLocalStorageImage(imagePath: string): void {
    try {
      const userData = JSON.parse(localStorage.getItem('data') || '{}');
      userData.profileImage = imagePath;
      localStorage.setItem('data', JSON.stringify(userData));
    } catch (e) {
      console.error('Error updating local storage:', e);
    }
  }

  async loadProfileImage(): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      const response = await lastValueFrom(
        this.http.get<ApiResponse<{ imagePath: string }>>(
          `${this.apiUrl}/TblUser/GetProfileImage`, 
          { headers }
        )
      );

      if (response?.data?.  imagePath) {
        this.updateProfileImage(response.data.imagePath);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/signin']);
  }

  openLogoutModal(): void {
    this.showLogoutPopup = true;
  }

  confirmLogout(): void {
    this.logout();
    this.cleanupLogoutPopup();
  }

  cancelLogout(): void {
    this.cleanupLogoutPopup();
  }

  private cleanupLogoutPopup(): void {
    this.showLogoutPopup = false;
  }
}