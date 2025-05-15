
import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from './translate.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false 
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private langChangeSub: Subscription;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
  
    this.langChangeSub = this.translationService.currentLang$.subscribe(() => {
      this.cdr.markForCheck(); 
    });
  }

  transform(value: string): string {
    return this.translationService.translate(value);
  }

  ngOnDestroy(): void {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe(); 
    }
  }
}
