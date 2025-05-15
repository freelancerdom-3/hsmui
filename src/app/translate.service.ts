import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private translations: Record<string, string> = {};
  //private currentLang: string = 'Ek';
  private currentLangSubject = new BehaviorSubject<string>('EK');
  currentLang$ = this.currentLangSubject.asObservable();
  // private langSubject = new BehaviorSubject<string>(this.currentLang);
  // langChanged$ = this.langSubject.asObservable();

  constructor(private http: HttpClient) { }

  async load(lang: string) {
    //this.currentLang = lang;
    const data: any = await this.http.get('assets/translate.JSON').toPromise();
    this.translations = {};


      for (const entry of data.label) {
        if (entry.key && entry[lang]) {
          this.translations[entry.key] = entry[lang];
        }
      }

      this.currentLangSubject.next(lang);
    }
    catch (error) {
      console.error('Error loading translation file:', error);
    }
  

  translate(key: string): string {
    return this.translations[key] || key;
  }

  getLang() {
    return this.currentLangSubject.getValue();
  }
}
