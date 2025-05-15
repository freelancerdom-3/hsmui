import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  //change
  constructor(private http: HttpClient) { }

  public encryptionEnabled: boolean = false;


  loadEncryptionConfig(): Promise<void> {
    return this.http.get<{ encryptionstatus: boolean }>('../assets/config.json')
      .toPromise()
      .then(config => {
        this.encryptionEnabled = config.encryptionstatus;
        console.log('Config loaded: encryptionEnabled =', this.encryptionEnabled);
      })
      .catch(() => {
        console.warn('Failed to load config, defaulting encryptionEnabled to false');
      });
  }
}

export function initializeApp(configService: ConfigService): () => Promise<void> {
  return () => configService.loadEncryptionConfig();
}