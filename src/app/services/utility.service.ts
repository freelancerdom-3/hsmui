import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(private router: Router) { }

  extractLastSegment(url: string): string {
    const segments = url.split('/').filter(Boolean);
    return segments[segments.length - 1];
  }
}
