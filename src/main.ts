import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { provideToastr } from 'ngx-toastr';
import { EncryptionIntrerceptorService } from './app/services/encryption-intrerceptor.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { ConfigService, initializeApp } from './app/services/config.service';

if (environment.production) {
  enableProdMode();
}
//Hello 

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule),
    provideAnimations(),
    provideToastr(),
    //EncryptionInterceptor
    { provide: HTTP_INTERCEPTORS, useClass: EncryptionIntrerceptorService, multi: true },
    ConfigService, //config.json file uploader
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    }
  ]
}).catch((err) => console.error(err));
