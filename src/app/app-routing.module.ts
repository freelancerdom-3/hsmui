import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { BaseService } from './services/base.service';
const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/dashboard.component').then((c) => c.DashboardComponent)
      },
      {
        path: 'basic',
        loadChildren: () => import('./demo/ui-elements/ui-basic/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'forms',
        loadChildren: () => import('./demo/pages/form-elements/form-elements.module').then((m) => m.FormElementsModule)
      },
      {
        path: 'tables',
        loadChildren: () => import('./demo/pages/tables/tables.module').then((m) => m.TablesModule)
      },
      {
        path: 'apexchart',
        loadComponent: () => import('./demo/pages/core-chart/apex-chart/apex-chart.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/extra/sample-page/sample-page.component')
      },
      {
        path: 'home',
        loadComponent: () => import('./demo/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'beauty',
        loadComponent: () => import('./demo/beauty/beauty.component').then(m => m.BeautyComponent)
      },
      {
        path: 'native',
        loadComponent: () => import('./demo/native/native.component').then(m => m.NativeComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./demo/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'subcategory',
        loadComponent: () => import('./demo/subcategory/subcategory.component').then(m => m.SubcategoryComponent)
      },
    
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('./demo/pages/authentication/authentication.module').then((m) => m.AuthenticationModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes),HttpClientModule],
  exports: [RouterModule],
  providers: [BaseService]
})
export class AppRoutingModule {}
