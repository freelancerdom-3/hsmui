import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';
import { ConfigService } from './config.service';
import { AppConstant } from '../demo/baseservice/baseservice.service';

@Injectable({
  providedIn: 'root'
})
export class EncryptionIntrerceptorService implements HttpInterceptor {

  private encryptionEnabled: boolean;
  private baseUrl = AppConstant.url;

  constructor(private encryptionService: EncryptionService,
    private configService: ConfigService) { }

  loadEncryptionEnableStatusData() {
    this.encryptionEnabled = this.configService.encryptionEnabled;
  }

  //This method will enccrypt any url
  extractValueAfterEqualAndEncryptTillEndOfUrl(url: string): string {
    console.log("*****************************");
    console.log('General get encryption function');
    console.log("url in generic get function before encryption : " + url);

    url = url.startsWith(this.baseUrl) ? url.slice(this.baseUrl.length) : url;

    const countOfEquals = (url.match(/=/g) || []).length; //Count number of equal sign
    console.log("Count of equals in the GET url from interceptor : " + countOfEquals);
    if (countOfEquals >= 1) {
      const extractedValuesArray: string[] = [];
      const urlLen = url.length;
      //start iteration from the first found '=' sign in url
      // let nextIndexOfEqual = url.indexOf('=');
      let index = url.indexOf('=');
      while (index < urlLen) {
        if (url.charAt(index) === '=') {
          //skipping to next character after '='
          index += 1;
          //initialize empty string to reinitialize it with value
          let extractedSubstringValue = '';
          const start = index;
          let end = index;
          while (index < urlLen && url.charAt(index) !== '&') {
            end += 1;
            index += 1;
          }
          extractedSubstringValue = url.substring(start, end);
          extractedValuesArray.push(extractedSubstringValue);
        }
        index += 1;
      }
      console.log("Extracted values array from interceptor for get request : " + extractedValuesArray);
      let indexForIteration = 0;
      while (indexForIteration < extractedValuesArray.length) {
        url = url.replace(extractedValuesArray[indexForIteration], this.encryptionService.getEncryptedData(extractedValuesArray[indexForIteration]));
        indexForIteration += 1;
      }
      url = this.baseUrl + url;
      console.log("Generic method encrypted url : " + url);
    }
    return url;
  }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log("This is interceptor request : " + request.body);
    // console.log("The type of http request is : " + request.method);
    const startTime = Date.now();
    let message = `Started ${request.method} "${request.urlWithParams}" `;
    const requestUrl = request.urlWithParams;
    this.loadEncryptionEnableStatusData();
    //For encrypting the outgoing requests
    if (this.encryptionEnabled) {
      console.log("Is encryption enabled : " + this.encryptionEnabled);
      if (request.method === 'DELETE') {
        console.log("Delete request triggered : ");
        const modifiedRequestUrl = this.extractValueAfterEqualAndEncryptTillEndOfUrl(requestUrl);
        console.log("This is the original delete request : " + requestUrl);
        console.log("This is modified reqeust after encryption : " + modifiedRequestUrl);
        request = request.clone({
          url: modifiedRequestUrl
        })
      }

      else if (request.method === 'GET' && requestUrl.includes('=')) {
        const modifiedRequestUrl = this.extractValueAfterEqualAndEncryptTillEndOfUrl(requestUrl);
        console.log("Modified url from generic get method : " + modifiedRequestUrl);
        request = request.clone({
          url: modifiedRequestUrl
        })
      }
    }


    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            console.log("This message is from interceptor");
            const elapsed = Date.now() - startTime;
            message += `in ${elapsed} ms, returned ${event.status}`;
            console.log(message); // Log general info

            if (request.method === 'GET') {
              //For decrypting incoming response data
              if (this.encryptionEnabled) {
                const decryptedJSONEventData = this.encryptionService.getDecryptedData(event.body.data);
                console.log("Decrypted body data");
                event.body.data = decryptedJSONEventData;
              }
            }
          }
        },
        error: (error) => {
          const elapsed = Date.now() - startTime;
          message += `in ${elapsed} ms, error ${error.status}`;
        }
      })
    );
  }
}
