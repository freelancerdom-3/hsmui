import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import * as jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { DatatableComponent } from 'src/app/Common/datatable/datatable.component';
import autoTable from 'jspdf-autotable';





@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [SharedModule, DatatableComponent],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class billingComponent implements OnInit {
  billings: any[] = [];
  patientlist: any[];
  TreatmentcodeList: any[] = [];
  treatmentdetailsidwithnamelist: any[] = [];
  // PAGINATION
  paginatedList: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  itemsPerPage: number = AppConstant.RecordPerPage;
  pageNumbers: number[] = [];

  isShowList: boolean = true;
  selectedbillingId: number | null = null;
  URL = AppConstant.url
  http = inject(HttpClient);

  tableHeaders = [
    { label: 'FullName', key: 'patientName' },
    { label: 'BillID', key: 'billid' },
    { label: 'TotalAmount', key: 'totalAmount' },
    { label: 'PaymentMethod', key: 'paymentMethod' },
    { label: 'BillDate', key: 'billDate' },
    { label: 'CreatedBy', key: 'createdBy' },
    { label: 'CreatedOn', key: 'createdOn' },
    { label: 'UpdatedBy', key: 'updatedBy' },
    { label: 'UpdatedOn', key: 'updatedOn' },
    { label: 'IsActive', key: 'isActive' }
  ];


  constructor(
    private baseService: BaseService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) { }
  ngOnInit() {
    this.getbill();
    this.createFormGroup();
    this.gettreatmentdetailsidwithname();
    const admitionId = this.route.snapshot.paramMap.get('id');
    if (admitionId) {
      this.billingfmGroup.patchValue({
        treatmentDetailsId: parseInt(admitionId)
      });
      this.isShowList = false;
    }
  }

  billingfmGroup: FormGroup;

  // -PDF CODE

  // public downloadRowAsPDF(department: any) {
  //   const doc = new jsPDF('p', 'pt', 'a4');

  //   const user = [
  //     `Full Name: ${department.patientName}`,
  //     `Total Amount: ${department.totalAmount}`,
  //     `Payment Method: ${department.paymentMethod}`,
  //     `Bill Date: ${department.billDate}`,
  //   ];

  //   let y = 40;
  //   doc.setFontSize(12);
  //   user.forEach(line => {
  //     doc.text(line, 40, y);
  //     y += 20;
  //   });

  //   doc.save(`${department.patientName}.pdf`);
  // }
  public downloadRowAsPDF(department: any, download: boolean = false): Promise<string> {
    return new Promise((resolve) => {
      const doc = new jsPDF('p', 'pt', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const logo = new Image();
      logo.src = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4QBERXhpZgAASUkqAAgAAAABAGmHBAABAAAAGgAAAAAAAAABAAOQAgAUAAAAKAAAADIwMjE6MDc6MDcgMTU6MTQ6MjIA/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8IAEQgAlgCWAwERAAIRAQMRAf/EAB0AAQABBQEBAQAAAAAAAAAAAAAIBAUGBwkDAgH/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAgMBBAYFB//aAAwDAQACEAMQAAAAgV9r1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANn6Esv1s6O9WOc6uehHH236lzv7GqePKW4LtY2PpZs1uIPdTXPPkrcooYbssavxrfdju/y50E8bV8+VltciPouvJPw5yN8acPejrnfylu8vKlC3pq9S+jHZ2hLcnmS1vvR2To5hX08OlXE22K1yw72jpFxd1DnEYfejFn365I+JPqpwN2tN7EE+qrl/zs+d3ZVdO+Fu+coX9LXVYbQ0JQu6avolxtt+pz6GTUIF9ZXJzw58r++okZ4s9w+bLSvpxyKrOtNyOU059Yq2OcYvxd63vhXwzTyTh5WfJj6DTRzx+ZfWHzlURVsc+ReK1ZFSSeWVRF55W6bONXOJ7GL3VnHbsWO7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//xAAsEAABBAMAAgEDAgYDAAAAAAAEAgMFBgEHCAAJExEUFRI4FiIkMXaENWBw/9oACAEBAAESAP8AxXnjnuy9KX7NWrSxhXmhlmEmr5ROqd9uVUucmkCQr+MYbxNxv4aZPA+XD/2r62fl531Hne25qzR/vFR7Uo+vDxct6rdSVHP52cvs2DWQUfIbiE4Y5b3NWSmqHI4IfZT9MyXTPN87zTstyryj2DwyEfPGScN6kqKZTYb762z7FiywhZz+++LdKRVVApmsZrMvuF41kUUGnet3SepKqwftexYlDl/TDxW3PWLQL1THZ/S858B+G1OCi868/E7k6CjNbTLpEAv5iESWZv1h6QoJv5+y3iXjqsznGFsWX1raJ2XUWC6S+RB5fb+okxR/XNo/VMkwDtC8jWGbPz/Qgdh+t6rU/XEvd9Z5LAdhmVFmwvEfBda6R1pKW+zz8oAjB7oAgoXDHMmkD2ANlXZuSmDc/Vgfof1hVOVpZFk06++NJMsZKaiPWxV9dw+imDqktsm0k/RFmX7IYvVgVAKnZ6WzB7LwDliDX566M5x2DRf93z292+eYJoNZRl1itPtEHuecj22dp3R9AJrzzyCypgYF5n24gCu0bWxmfp981Musted1X8/W3J9rPiingZMloePYJ9RsOCdue4yRKEOnhwuMD59hV4sVt6itwM4t9AkK8gKNC9T94sQG75WrCLffrZ8W6UYwBDgwvtwIwAhDP3cSsp9Ht4tx7+yqRV8vZxFiRKpLDPqCsRxtAv8ACvELWABIjPjM9vWU60dVbFeOfW9kSTWAx5o+2n3711fkZV/JR2alKBre9Uv7XiP8gL83DbZu9bStU3Y3nXpkqRfy/wCeo63TszrO6wh5LxMLEHsfjscZoREd+9BxYGfii/6t3LHsxJef66sqHV5WhkIBDWPPXV+8Gif7vnTOrtW7fqoFd2ZIhRWHiM5iy9O8W6b5ROzezZpZhoiF5YmO+erAOhdmxYdbdW9Ta1+tAj/sh2LATPHsW6HIjv8A8RGAPAI5Z3+bzdt+NtrDKzI3KchyYVw0toHvkQC2hS+XpfDGELNEZ0J66KVLvCGYXOmJ+uWOQd1vbD7+Cu9rMZCKn3DUYx7WrFHTfR0YKCW0U9GQLIpePUFaIoHGzIYk5hiReyEY0x09PA2jonZErGEtmAFTpa2COY7/AF6N9aUusmUHaxFxMwEWj1R/tfK/yEvzZ/C+jOhdmS0yBZ8gWH7rKpoC3bL1BwDp12Ag3RcSLKFuBQfBvRQVE6jk7DdpFsZi3skDGyfsk5yp91pRu4g7GNFzoATbWUeevMtkTr+g5eXhvC1lt489usnh/dFNAw/+vA0D8uWKDE0+f0VmWk6eg6ZGs0dXfvT+OoqXlbJKw1xQLUYuRkhH8wekBzZ7YIMvasMRdIVjBB9k49lavZnoQqfHefYBLNedO5cDCBthMBe1zR9eJLEeEA5WZiZyxNz80g8QCXmIJx6a0RCI3DtWFFsBcbUqMsh8g/dGkq9qPVsOwsnMvcz7KaERKW7kPNZir2eBcsSOaa8YHJoY5NjayfliasrRprzExlgC6csRLUxbXqtaiV1atvPpmHPVlKiR3KkuU++hDIc6a6R4fJOkTBpqH3MOvvOOZdWtTi8rWrKlZ/urxTq1ISjK1ZQn+yfI6RLhzxzgCngjR14dZJtFtm7vNPzFhlzZyVf+mHTRLDKAR2QBpEocHJLZuRozadyhS0kgWqYDIS8+Rhym7htVCxZHYaUfFkp9ttBUo1tW6MRbsai2TSY915ZDg2Nl23EXIRuLNLfYSDrj5Y0vty7z/wDyVumz/wCRbfje0rizb37Ui0S6bKQnKHpaSt03NZb/ACcsbJpQU6bhN46V2LebqXZSLTJgEuPkvMCl7Jtp5eCibNLEE4wQnDzu7bMTSpyvEk5MXN4FZPloO92SsRMpFw8/JxcbKI+I4P8A7v8A/8QAORAAAgEDAgMFAwoGAwAAAAAAAQIDAAQREiEFE0EiMVFhcRAyQgYUFSMzUlNiY4JgcIOEobNzorH/2gAIAQEAEz8A/krelhBbxKQMtpBOSzKAAKse2L0umuExlhk8wYCDAJbIOKUYDaWIzikTW0USRtI5A8dKHFX81vCvqZ9ACCuCcda5mhboXR2Yf9RSJoS7gJIBI+FwRhlqAwmAuRkhEKZAHrQ4qLqe4y/15uY12hRIw8hbC4CVf8T+jLEP9yPDKT6lqN+L2wvvyLNklD55YUUxPbiBHaRAD3PlNNcWv7a3jL9AZ9C1wjiJvreXzIdmDj0ZavL5eEo4/JEJeY5/dVzOZ4pbdd3aJmyysoy2CSCK4Xy1wURCZHZ1bq9cc4ulgNHQiOMqf3Fqe6N1a36d4EMhywYju3INTbXcN0M/UuveiL8NcMnZL28XX9lIi+/BnOS3s/s5q+C5uVIQBv8AjX/bURIFxBLKqSRt4gqa/TeLL/5RKtzh4+bKqOQenY10+5UPModhTk6IoAikOo/UzrrJMUEkZTRN4AnOik/Faw7RroZpZnjJPosNdIjMjh/9QrpHFD2EUU+5cQpPChP7UFf04Km74yHKiMDoEACgdAKl3EJlRzLGnllUak2QSC9T/wA1yV0ReQrYHs/s5qlv4rS6SbryGfvJBAK4Ir5R3cKQWgPxRgBVDY60U0G8mYjmzgHcLhEC5oSgvKgBlLgeAApDg3Fq+NQH5lIV180rgl0kF6E6R3MTq26+a1PcpccWvyPcjAAGhM+SrTviOIvAyQQKT4AIi1Ec8mUzTvoPnpdTUrgF4kEwdh6ErURykqcwgMp6g0XAZJpGnMcfq/MTFf04K+TvEbd8y/GXiIcxSE99JOJr2/uiMCSfqATjLnAAGBU5xHFcSzLMHc9FLpijKrwcWQPhFX9TDbEezza0mAFdEL3En+SEpuK3Y1Jcx3EjTcsSaA68lQABip7MLNbtb3kECxpzZlWRT87i7bOhwrbZwDwuza+FyjXiWwaBNSbFpFbcjaoLVzGvI4p9H6ckj3jh8nGM6atuHciYm2IE0uhphIYd3xJGrgBCXEdC3kEgNi1oGuYwHGSwutlbIGKlsTPeclLtLYIkIddbcyVRqLKMAtRilRBbww2zoIwXwMi5Rm1pqyxXbR234ZJbFriHQQsWXOtHVz2+hXuwQSeHSquLLh4upZmdZQQy610JuGZcNXEbEpNYrHZ8+B2AfEnPcPCnd26/DUQwtQYhm1MTkmmOSfYTsPZbyFJInByGVhuCD1FcQnaaZwBgAsxJ2FRzMsZnjDCOXSDjWoZgG7xqNQ3sinmzFTM+x73KIWPXQtCZxdqVnWfUsgYHUzIMk5yCaF/Ly3kdw7ORqwSXUMT4jNfPJOXPJIQZGcZ3LkDUeuBmri/kfsuFDjc/EETPjpFC8k+cygqFIaTOWGABg1eXDyjnyFTLJufefQmpu86RVjezJBZrP9rFCpYlUIwuPAAVLeSM+J0Ec4yTn6xAFb7w2NXU80t3Pa22DBa5ZyoiRgCAFzsBnFWd3JFFdL4SIpAYev8AHH//xAAzEQABAgQEAgkEAQUAAAAAAAABAgMABAUREiExQROBBhAyUWFxkaGxFCI0wUIjYHDR4f/aAAgBAgEBPwD/AArOTjck1xHIFQDjSHWhcK9oQrGkKicmPpGFPWvaE1+ac+xDYKjpa/xCqrUpZf8AXHIi0SM6ieZ4iciNRCukLwcVZAw7RKVOcUsuzCbNW1tbyt3w5WpyYWRLJsPK5iWrj7TmCbTl5WIicnBLSxmEZ6W5wiuzjwwNoBV4A/EIrc6wuz2fgRaHa1OTAJlkWA1NrxTa0446GZjO+h8YqlWckng02kHK+cGq1GaBVLosB3C8SdddS5w5vTv0IitOPqmLO9n+PdaKIqZLoQgXbvnfQf8Aeqs/gr5fMdHG0EOOfyyHKKi2hyVcDmwJjo6TxHRtaKSyl+dSlQuBcx0hUQwhI0JijNNtyaCjU5nzivtNmXDh7QOUFRVRc9j+46ONpDS3N72jpEgB1CxqQYpSEok2wNxf1iabS1VMKdMQ97GK9+XyH7iVbQ0ylDegEdIW0JdQtIzIN4qRKqawpWuXxFDFpJPmfnqrP4LnL5iRfmZZZclxfvyuOcTNTm6gOClNgdhFIp6pNklztK9oorK0zxBHZveJ+TE6wWjrt5w1Mz1IJaIy8dORg/W1lwAjIcgIqMqGaaWWhfDb5zMdH0KRKkkamOkTajw1gZZiJBBblW0q1AETzLhqosNSk/EV/wDL5D9wxVZyTaCFJunYkGGmJqrv416bnYDwirSRdkwhkdi1h4DKKJOutOCUKbgn06qwCZFy3h8x0dTZhZ8f1DqnUTOBK7DCToNrQKkpKUpWj7iB7gnYeEKmiEtlKM17HLa+cIqKXEYwncD1TigT5JSFt2Crb9+m2sGfxJTw02JCT63y9oRNr4DSym6l2yvlpeJaacmHlbJCQbeJv/qG6jxCgFFsdiM9jBqCli6E2H2537zaGp9WFIcT9ytLHXOx9NTFdSVTgA3A+TCUgJAPXbqKQoWIuIbbQ0nA2LDwgoSTiIz0gy7KhYpHp3aQ5LNu4QsZJ220tH07N8WAX8o4DVwrCLiEyzKOygDlH07WDhYRh7oS0hHZFtoakWGmw2Eg6c7QGGgLBI29tIEq2HErG17Da51MLZbWoKWkEjT++P/EACMRAAIDAQACAQQDAAAAAAAAAAABAhExEhAhAyIwMkJRYHD/2gAIAQMBAT8A/wAVSs58JWzhHMWNUcIcViOEtHBPBK3RwjhCglo4evRGNo5itHD+CFUSrxDSZHSZLD4yWkNP2Jnx4S0XuJDB6Qwj+TJ74ho0nooqJKVslhF0ylI9QIu5E9PjHpF/SQwcUz1FEX7JJb4hpMVUclHJycle2NUjk5OSGfZsstllst+LZZf95//Z';
      doc.addImage(logo, 'PNG', 45, 25, 85, 75);

      doc.setFontSize(18);
      doc.setTextColor(0, 102, 204);
      doc.text('PROMPT HOSPITALS', pageWidth / 2, 50, { align: 'center' });

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text('MAURYA TIME SQUARE,SCIENCE CITY ROAD,', pageWidth / 2, 65, { align: 'center' });
      doc.text('AHMEDABAD - 381006 (India)', pageWidth / 2, 80, { align: 'center' });
      doc.text('Tel.: +91-80-263040 / 2630405   Fax: +91-80-4143151', pageWidth / 2, 95, { align: 'center' });

      doc.setLineWidth(1);
      doc.line(40, 110, 550, 110);


      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('INPATIENT BILL', pageWidth / 2, 130, { align: 'center' });

      doc.setFont(undefined, 'normal');
      const detailsY = 150;

      doc.text(`Patient Name: ${department.patientName}`, 40, detailsY);
      doc.text(`Bill Date: ${department.billDate}`, pageWidth - 40 - doc.getTextWidth(`BILL DATE: ${department.billDate}`), detailsY);

      doc.setLineWidth(0.5);
      doc.line(40, detailsY + 20, 550, detailsY + 20);

      const tableRows = [
        ['TOTAL AMOUNT:', department.totalAmount],
        ['PAYMENT METHOD:', department.paymentMethod || 'N/A'],
      ];

      autoTable(doc, {
        startY: detailsY + 30,
        head: [['Description', 'Details']],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 11 },
        headStyles: { fillColor: [0, 102, 204] },
        columnStyles: {
          1: { halign: 'right' },
        },
      });

      // const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : detailsY + 100;


      const footerY = pageHeight - 80;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('This is a computer generated statement and requires no signature.', 40, footerY);
      doc.text('For billing and general enquiries, please mail: customercare_ahemdabad@prompthospitals.com', 40, footerY + 20);

      doc.setFontSize(8);
      doc.text('© Prompt Hospitals, Ahmedabad 2013, All Rights reserved', 40, footerY + 40);
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      if (download) {
        doc.save(`${department.patientName}_bill.pdf`);
      }

      resolve(pdfBase64);
    });
  }
  async sendPdfByEmail(bill: any) {
    try {
      // Generate PDF and get Base64 string
      const pdfBase64 = await this.downloadRowAsPDF(bill, false);

      // Prepare request object
      const request = {
        BillId: bill.billid,
        PdfBase64: pdfBase64
      };

      // Call your backend API
      this.baseService.POST(this.URL + "TblBill/EmailBillPdfToPatient", request).subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success('Bill sent successfully!', 'Success');
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        error: (err) => {
          this.toastr.error('Failed to send bill', 'Error');
          console.error("Email Error:", err);
        }
      });
    } catch (error) {
      console.error('Error generating or sending PDF:', error);
      this.toastr.error('Failed to generate or send PDF', 'Error');
    }
  }



  //  -END


  createFormGroup() {
    const today = new Date().toISOString().split('T')[0];
    this.billingfmGroup = new FormGroup({
      billId: new FormControl(0, [Validators.required]),
      paymentMethod: new FormControl('', [Validators.required]),
      billDate: new FormControl(today, [Validators.required]),
      treatmentDetailsId: new FormControl(0, [Validators.required]),
      totalAmount: new FormControl('', [Validators.required])
    });
    console.log("Form Initialized:", this.billingfmGroup.value);
  }

  limitTotalAmount(event: any) {
    let val = event.target.value;
    if (val.replace('.', '').length > 7) {
      val = val.slice(0, 11); // 10 digits + dot (if present)
      event.target.value = val;
      this.billingfmGroup.get('totalAmount')?.setValue(val);
    }
  }


  getbill() {
    this.baseService.GET<any>(this.URL + "TblBill/GetAll").subscribe({
      next: (response) => {
        console.log("GET Response:", response);
        this.billings = response.data;
        this.totalRecords = this.billings.length;
        this.totalPages = Math.ceil(this.totalRecords / this.itemsPerPage);
        this.PageNumber();
        this.Paginationrecord();
      },
    });
  }
  addbilling() {
    const data = this.billingfmGroup.getRawValue();
    console.log("Submitting Billing Data:", data); // ✅ Debug

    this.baseService.POST(this.URL + "TblBill/Add", data).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.toastr.success(response.message, 'Success');
          this.getbill();
          this.isShowList = true;
          this.currentPage = 1;
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      error: (err) => {
        this.toastr.error('Failed', 'Error');
        console.error("POST Error:", err);
      }
    });
  }

  // onTableAction(event: { action: string; row: any }) {
  //   const actionHandlers: { [key: string]: () => void } = {
  //     download: () => this.downloadRowAsPDF(event.row),
  //   };

  //   const actionKey = event.action.toLowerCase();

  //   if (actionHandlers[actionKey]) {
  //     actionHandlers[actionKey]();
  //   } else {
  //     console.warn('Unknown action:', event.action);
  //   }
  // }
  onTableAction(event: { action: string; row: any }) {
    const actionHandlers: { [key: string]: () => void } = {
      download: () => {
        // Only download
        this.downloadRowAsPDF(event.row, true)
          .catch(error => {
            console.error('Error generating PDF:', error);
            this.toastr.error('Failed to generate PDF', 'Error');
          });
      },
      email: () => {
        // Only email (no download)
        this.sendPdfByEmail(event.row);
      }
    };

    const actionKey = event.action.toLowerCase();

    if (actionHandlers[actionKey]) {
      actionHandlers[actionKey]();
    } else {
      console.warn('Unknown action:', event.action);
    }
  }

  gettreatmentdetailsidwithname() {
    this.baseService.GET<any>(this.URL + "GetDropDownList/FillTreatmentCode").subscribe(response => {
      console.log("GET Response:", response);
      this.treatmentdetailsidwithnamelist = response.data;
      console.log("treamentdetailslistwithname", this.treatmentdetailsidwithnamelist);
    })
  }
  //PAGINATION STOP
  Paginationrecord() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedList = this.billings.slice(startIndex, endIndex);
  }

  //page number
  PageNumber() {
    this.pageNumbers = [];
    for (let i = 1; i <= Math.min(this.totalPages, 3); i++) {
      this.pageNumbers.push(i);
    }
  }
  //change page
  nextpage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.Paginationrecord();
    }
  }
}
