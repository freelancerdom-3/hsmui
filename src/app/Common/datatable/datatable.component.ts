import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Input, Output, SimpleChanges } from '@angular/core';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [CommonModule, CardComponent, SharedModule],
  templateUrl: './datatable.component.html',
  styleUrl: './datatable.component.scss'
})
export class DatatableComponent {
  @Input() tableHeaders: { label: string, key: string }[] = [];
  @Input() tableData: any[] = [];
  @Input() actionButtons: string[] = [];
  //@Input() hiddenColumns: string[] = [];
  //@Input() primaryKey: string = 'id';
  //@Output() edit = new EventEmitter<any>();
  //@Output() delete = new EventEmitter<any>();
  @Output() actionClicked = new EventEmitter<{ action: string, row: any }>();
  @Input() showOnlyButtons: boolean = false;



  displayedColumns: string[] = [];

  onButtonClick(action: string, row: any) {
    this.actionClicked.emit({ action, row });
  }

  // onEdit(row: any): void {
  //   this.edit.emit(row);
  // }

  // onDelete(id: number): void {
  //   this.delete.emit(id);
  // }
}
