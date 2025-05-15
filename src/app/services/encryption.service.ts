import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }
  //chnage
  private readonly secretKey = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012'); //32 character
  private readonly vector = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 character

  getEncryptedData(data: any): string {
    try {
      const encryptedData = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(data),
        this.secretKey,
        {
          keySize: 256 / 8,
          iv: this.vector,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );
      return encodeURIComponent(encryptedData.toString());
    }
    catch (error) {
      console.log('Failed to encrypt : ' + error);
      return null;
    }
  }

  getDecryptedData(encryptedData: string): any {
    try {
      encryptedData = decodeURIComponent(encryptedData);
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, this.secretKey, {
        keySize: 256 / 8,
        iv: this.vector,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
    }
    catch (error) {
      console.log('Failed to decrypt : ' + error);
      return null;
    }
  }
}
