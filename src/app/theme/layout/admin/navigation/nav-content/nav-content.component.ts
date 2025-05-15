/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no- */
/* eslint-disable @typescript-eslint/no-explicit-any */
// angular import
import { Component, inject, output, OnInit, OnChanges, SimpleChange, SimpleChanges, Input } from '@angular/core';
import { Location } from '@angular/common';

// project import
import { environment } from 'src/environments/environment';
import { NavigationItem, NavigationItems } from '../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavGroupComponent } from './nav-group/nav-group.component';


@Component({
  selector: 'app-nav-content',
  imports: [SharedModule, NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit, OnChanges {
  private location = inject(Location);

  // public method
  // version
  title = 'Demo application for version numbering';
  currentApplicationVersion = environment.appVersion;

  // navigations!: NavigationItem[];
  wrapperWidth: number;
  windowWidth = window.innerWidth;

  NavCollapsedMob = output();
  // menuPermissions: any[] = [];
  visibleMenus: any[] = [];
  // constructor

  @Input() menuPermissions: any[] = [];
  @Input() navigations: NavigationItem[] = [];

  // ngOnInit() {
  //   
  //   this.permissionbasedonIsview(this.navigations);

  // }

  // ngOnChanges(changes: SimpleChanges) {
  //   
  //   const Permissionforviwe = localStorage.getItem('MenuPermission');
  //   this.menuPermissions = Permissionforviwe ? JSON.parse(Permissionforviwe) : [];
  //   this.navigations = NavigationItems;
  //   this.permissionbasedonIsview(this.navigations);
  // }

  ngOnChanges(changes: SimpleChanges) {
    ;
    if (changes['menuPermissions'] || changes['navigations']) {
      this.permissionbasedonIsview(this.navigations);
    }
  }


  // constructor() {
  //   // optional: move this to ngOnInit if you prefer
  //   const storedPermissions = localStorage.getItem('MenuPermission');
  //   this.menuPermissions = storedPermissions ? JSON.parse(storedPermissions) : [];
  //   this.navigations = NavigationItems;
  // }

  constructor() {
    // ;
    // const Permissionforviwe = localStorage.getItem('MenuPermission');
    // this.menuPermissions = Permissionforviwe ? JSON.parse(Permissionforviwe) : [];
    // this.navigations = NavigationItems;
    // this.permissionbasedonIsview(this.navigations);
  }
  ngOnInit() {
    ;
    const Permissionforviwe = localStorage.getItem('MenuPermission');
    this.menuPermissions = Permissionforviwe ? JSON.parse(Permissionforviwe) : [];
    this.navigations = NavigationItems;
    this.permissionbasedonIsview(this.navigations);
  }
  permissionbasedonIsview(items: NavigationItem[]) {
    items.forEach(item => {
      if (item.children?.length) {

        this.permissionbasedonIsview(item.children);
      }

      if (item.menuId) {
        const permission = this.menuPermissions.find(p => p.menuID === item.menuId);

        if (permission) {
          item.hidden = !permission.isView;
        } else {
          item.hidden = true;
        }
      }
    });
  }

  // verifyIsView(NavigationItems:NavigationItem[])
  // {
  //   NavigationItems.forEach(x=>x.menuId&&this.menuPermissions.find(x=>x.menuId)==7 also add Isview permission)
  // }




  fireOutClick() {
    let current_url = this.location.path();
    if (this.location['_baseHref']) {
      current_url = this.location['_baseHref'] + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent.parentElement.parentElement;
      const last_parent = up_parent.parentElement;
      if (parent.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger');
        parent.classList.add('active');
      } else if (up_parent.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger');
        last_parent.classList.add('active');
      }
    }
  }
}
