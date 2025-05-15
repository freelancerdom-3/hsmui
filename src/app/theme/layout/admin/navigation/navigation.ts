

export interface NavigationItem {
  id: string;
  menuId?: number;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'MenuPermissionModel',
    title: 'Menu Permission',
    // menuId:25,
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'patientdata',
        title: 'MenuPermission',
        type: 'item',

        url: '/MenuPermissionModel',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },
    ]
  },

  {
    id: 'UserPermissionModel',
    title: 'UserPermission',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'patientdata',
        title: 'UserPermission',
        type: 'item',
        url: '/UserPermissoin',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },
    ]
  },

  {
    id: 'master',
    title: 'Master',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'shift',
        menuId: 10,
        title: 'ShiftType',
        type: 'item',
        url: '/shift',
        icon: 'feather icon-clock',
        classes: 'nav-item'
      },
      {
        id: 'hospitaltype',
        menuId: 7,
        title: 'HospitalType',
        type: 'item',
        url: '/hospitaltype',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },
      {
        id: 'medicinetype',
        menuId: 12,
        title: 'MedicineType',
        type: 'item',
        url: '/medicinetype',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },

      {
        id: 'hospitaldepartment',
        menuId: 8,
        title: 'HospitalDepartment',
        type: 'item',
        url: '/hospitaldepartment',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },
      // {
      //   id: 'patientdata',
      //   title: 'Patient Data',
      //   type: 'item',
      //   url: '/patientdata',
      //   icon: 'feather icon-disc',
      //   classes: 'nav-item'
      // },

      {
        id: 'room type',
        menuId: 13,
        title: 'RoomType',
        type: 'item',
        url: '/roomtype',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },
      {
        id: 'room',
        menuId: 16,
        title: 'Room',
        type: 'item',
        url: '/room',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },
      {
        id: 'Roles',
        menuId: 9,
        title: 'Roles',
        type: 'item',
        url: '/roles',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },
      {
        id: 'Facility Type',
        menuId: 14,
        title: 'FacilityType',
        type: 'item',
        url: '/facilitytype',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },

      // {
      //   id: 'diseasetype',
      //   menuId:11,
      //   title: 'Disease Type',
      //   type: 'item',
      //   url: '/diseasetype',
      //   icon: 'feather icon-disc',
      //   classes: 'nav-item'
      // },

      {
        id: 'diseasetype',
        menuId: 11,
        title: 'DiseaseType',
        type: 'item',
        url: '/diseasetype',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },

      {
        id: 'facility',
        menuId: 1,
        title: 'Facility',
        type: 'item',
        url: '/facility',
        icon: 'feather icon-disc',
        classes: 'nav-item'
      },

    ]

  },

  {
    id: 'data',
    title: 'Data',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'patientdata',
        title: 'PatientData',
        menuId: 20,
        type: 'item',
        url: '/patientdata',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },
      {
        id: 'Empshiftmapping',
        menuId: 15,
        title: 'EmployeeShiftMapping',
        type: 'item',
        url: '/empshiftmapping',
        icon: 'feather icon-watch',
        classes: 'nav-item'
      },
      {
        id: 'Empdepartmentmapping',
        menuId: 19,
        title: 'EmployeeDepartment',
        type: 'item',
        url: '/empdepartmentmapping',
        icon: 'feather icon-briefcase',
        classes: 'nav-item'
      },
      {
        id: 'patientdoctormapping',
        //menuId:,
        title: 'PatientDoctorMapping',
        type: 'item',
        url: '/patientdoctormapping',
        icon: 'feather icon-activity',
        classes: 'nav-item'
      },
      {
        id: 'medicinedetails',
        menuId: 22,
        title: 'MedicineDetails',
        type: 'item',
        url: '/medicinedetails',
        icon: 'feather icon-slack',
        classes: 'nav-item'
      },
      {
        id: 'roomTypeFacilityMapping',
        menuId: 18,
        title: 'RoomtypeFacility',
        type: 'item',
        url: '/roomTypeFacilityMapping',
        icon: 'feather icon-wifi',
        classes: 'nav-item'
      },
      {
        id: 'PatientAdmitionDetails',
        menuId: 23,
        title: 'PatientAdmitionDetails',
        type: 'item',
        url: '/PatientAdmitionDetails',
        icon: 'feather icon-slack',
        classes: 'nav-item'
      },


      {
        id: 'treatmentdetails',
        menuId: 21,
        title: 'TreatmentDetails',
        type: 'item',
        url: '/treatmentdetails',
        icon: 'feather icon-plus',
        classes: 'nav-item'
      },
      {
        id: 'medicinedieseasemapping',
        title: 'MedicineDieseaseMapping',
        type: 'item',
        url: '/medicinedieseasemapping',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },
      {
        id: 'billing',
        menuId: 24,
        title: 'Billing',
        type: 'item',
        url: '/billing',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },
      {
        id: 'feedback',
        title: 'Feedback',
        type: 'item',
        url: '/feedback',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },

    ]
  },

  {
    id: 'ui-element',
    title: 'UI ELEMENT',
    menuId: 100,
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'basic',
        title: 'Component',
        type: 'collapse',
        icon: 'feather icon-box',
        children: [
          {
            id: 'button',
            title: 'Button',
            type: 'item',
            url: '/basic/button'
          },
          {
            id: 'badges',
            title: 'Badges',
            type: 'item',
            url: '/basic/badges'
          },
          {
            id: 'breadcrumb-pagination',
            title: 'Breadcrumb & Pagination',
            type: 'item',
            url: '/basic/breadcrumb-paging'
          },
          {
            id: 'collapse',
            title: 'Collapse',
            type: 'item',
            url: '/basic/collapse'
          },
          {
            id: 'tabs-pills',
            title: 'Tabs & Pills',
            type: 'item',
            url: '/basic/tabs-pills'
          },
          {
            id: 'typography',
            title: 'Typography',
            type: 'item',
            url: '/basic/typography'
          }
        ]
      }
    ]
  },
  {
    id: 'forms',
    title: 'Forms & Tables',
    type: 'group',
    menuId: 100,
    icon: 'icon-group',
    children: [
      {
        id: 'forms-element',
        title: 'Form Elements',
        type: 'item',
        url: '/forms/basic',
        classes: 'nav-item',
        icon: 'feather icon-file-text'
      },
      {
        id: 'tables',
        title: 'Tables',
        type: 'item',
        url: '/tables/bootstrap',
        classes: 'nav-item',
        icon: 'feather icon-server'
      }
    ]
  },
  {
    id: 'chart-maps',
    title: 'Chart',
    menuId: 0,
    type: 'group',
    icon: 'icon-charts',
    children: [
      {
        id: 'apexChart',
        title: 'ApexChart',
        type: 'item',
        url: 'apexchart',
        classes: 'nav-item',
        icon: 'feather icon-pie-chart'
      }
    ]
  },
  {
    id: 'pages',
    title: 'Pages',
    menuId: 100,
    type: 'group',
    icon: 'icon-pages',
    children: [
      {
        id: 'auth',
        title: 'Authentication',
        type: 'collapse',
        icon: 'feather icon-lock',
        children: [
          {
            id: 'signup',
            title: 'Sign up',
            type: 'item',
            url: '/auth/signup',
            target: true,
            breadcrumbs: false
          },
          {
            id: 'signin',
            title: 'Sign in',
            type: 'item',
            url: '/auth/signin',
            target: true,
            breadcrumbs: false
          }
        ]
      },
      {
        id: 'sample-page',
        title: 'Sample Page',
        type: 'item',
        url: '/sample-page',
        classes: 'nav-item',
        icon: 'feather icon-sidebar'
      },
      {
        id: 'disabled-menu',
        title: 'DisabledMenu',
        type: 'item',
        url: 'javascript:',
        classes: 'nav-item disabled',
        icon: 'feather icon-power',
        external: true
      },
      {
        id: 'buy_now',
        title: 'Buy Now',
        type: 'item',
        icon: 'feather icon-book',
        classes: 'nav-item',
        url: 'https://codedthemes.com/item/datta-able-angular/',
        target: true,
        external: true
      }
    ]
  }
]
