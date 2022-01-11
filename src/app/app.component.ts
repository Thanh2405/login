import { Component,OnInit } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'tng-portal';
  constructor(
    private permissionsService: NgxPermissionsService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('profile') !== null) {
      const permissions = JSON.parse(
        localStorage.getItem('profile')||'{}'
      ).permissions;
      const permissionsArray = permissions.map((per: any) => {
        return per;
      });
      this.permissionsService.addPermission(permissionsArray);
      // this.authService.getProfileData();
    }
  }
}
