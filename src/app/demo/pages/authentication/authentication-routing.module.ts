import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'signin',
        loadComponent: () => import('./auth-signin/auth-signin.component')
      },
      // {
      //   path: 'signup',
      //   loadComponent: () => import('./auth-signup/auth-signup.component')
      // }
      {
        path: 'verifyotp',
        loadComponent: () => import("./verifyotp/verifyotp.component").then(m => m.VerifyotpComponent)
      },

      {
        path: 'dashboard',
        loadComponent: () => import("../../dashboard/dashboard.component").then(m => m.DashboardComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
