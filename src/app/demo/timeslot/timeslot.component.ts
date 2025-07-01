import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseService } from 'src/app/services/base.service';

export interface TimeslotState {
  date: string;  // ISO yyyy‑MM‑dd
  time: string;  // "01:00 PM"
}

/* ------------------- internal models ------------------------ */
interface ApiSlot   { timeSlotId: number; time: string; specialSlot: boolean; }
interface UiDay     { date: Date; label: string; dayNum: number; selected: boolean; }

@Component({
  selector: 'app-timeslot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeslot.component.html',
  styleUrls: ['./timeslot.component.scss']
})
export class TimeslotComponent implements OnInit {

  /* ----------- inputs / outputs ----------------------------- */
  @Input()  initialSelection?: TimeslotState;
  @Output() slotSelected = new EventEmitter<TimeslotState>();
  @Output() closed       = new EventEmitter<void>();

  /* ----------- UI state ------------------------------------- */
  uiDays: UiDay[] = [];
  pickedOn!: UiDay;

  slots: ApiSlot[]         = [];
  filteredSlots: ApiSlot[] = [];
  selectedSlot: ApiSlot | null = null;

  loading = false;

  constructor(private base: BaseService) {}

  /* ----------- life‑cycle ----------------------------------- */
  ngOnInit(): void {
    this.buildFourDays();
    this.fetchSlotsOnce();
  }

  /* ----------- build today + next 3 ------------------------- */
  private buildFourDays(): void {
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      this.uiDays.push({
        date: d,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        selected: i === 0
      });
    }

    /* pre‑pick day if editing */
    if (this.initialSelection) {
      const initDate = new Date(this.initialSelection.date);
      const found    = this.uiDays.find(u => this.sameDate(u.date, initDate));
      this.pickedOn  = found ?? this.uiDays[0];
      this.uiDays.forEach(d => (d.selected = d === this.pickedOn));
    } else {
      this.pickedOn = this.uiDays[0];
    }
  }

  /* ----------- fetch once, then filter ---------------------- */
  private fetchSlotsOnce(): void {
    this.loading = true;
    this.base.GET<any>('https://localhost:7282/api/TimeSlots')
      .subscribe({
        next: res => {
          this.slots = res.data ?? [];
          this.applyCutoffIfToday();

          /* pre‑pick time if editing */
          if (this.initialSelection) {
            this.selectedSlot = this.slots.find(
              s => s.time === this.initialSelection!.time
            ) ?? null;
          }

          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  /* ----------- cutoff (today only) -------------------------- */
  private applyCutoffIfToday(): void {
    if (!this.isToday(this.pickedOn.date)) {
      this.filteredSlots = this.slots.slice();
      return;
    }

    const now          = new Date();
    const cutoffMillis = now.getTime() + 2 * 60 * 60 * 1000;

    this.filteredSlots = this.slots.filter(slot => {
      const [time, period] = slot.time.split(' ');
      let   [hour, minute] = time.split(':').map(Number);

      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour  = 0;

      const slotDate = new Date(now);
      slotDate.setHours(hour, minute, 0, 0);

      return slotDate.getTime() >= cutoffMillis;
    });
  }

  /* ----------- UI helpers ----------------------------------- */
  choose(day: UiDay): void {
    this.uiDays.forEach(d => (d.selected = d === day));
    this.pickedOn     = day;
    this.selectedSlot = null;
    this.applyCutoffIfToday();
  }

  select(slot: ApiSlot): void { this.selectedSlot = slot; }

  proceed(): void {
    if (!this.selectedSlot) return;

    this.slotSelected.emit({
      date: this.pickedOn.date.toISOString().split('T')[0],
      time: this.selectedSlot.time
    });
  }

  cancel(): void { this.closed.emit(); }

  /* ----------- utility -------------------------------------- */
  private sameDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth() &&
           a.getDate()     === b.getDate();
  }

  private isToday(d: Date): boolean { return this.sameDate(d, new Date()); }
}
