// angular import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// project import
import { CardComponent } from './components/card/card.component';

// bootstrap import
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

// third party
import { NgScrollbarModule } from 'ngx-scrollbar';
import { TranslatePipe } from 'src/app/translate.pipe';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CardComponent, NgbModule, NgScrollbarModule, NgbCollapseModule,TranslatePipe,NgbDropdownModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, CardComponent, NgbModule, NgScrollbarModule, NgbCollapseModule,TranslatePipe,NgbDropdownModule]
})
export class SharedModule {}
