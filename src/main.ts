import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations'; // ✅ Needed for Toastr
import { provideToastr } from 'ngx-toastr'; // ✅ Provide this

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
		importProvidersFrom(BrowserModule, AppRoutingModule),
		provideHttpClient(),
    provideAnimations(),   // ✅ Enables animations
    provideToastr(),       // ✅ Enables toastr globally
    ]
}).catch((err) => console.error(err));
