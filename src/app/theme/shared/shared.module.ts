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
import { ImageurlPipe } from 'src/app/pipes/imageurl.pipe';
import { NestedImageUrlPipe } from 'src/app/pipes/nested-image-url.pipe';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CardComponent, NgbModule, NgScrollbarModule, NgbCollapseModule, ImageurlPipe, NestedImageUrlPipe],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, CardComponent, NgbModule, NgScrollbarModule, NgbCollapseModule, ImageurlPipe, NestedImageUrlPipe]
})
export class SharedModule {}
