import { Injectable } from '@angular/core';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';

import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { RedirectService } from './redirect.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastrService: ToastrService,
    private permissionsService: NgxPermissionsService,
    private redirect: RedirectService
  ) {}

  api = environment.apiUrl;
  userProfile = {};

  renewAccessToken() {
    return this.http.get(this.api + '/auth/access-token');
  }

  login(username: string, password: string, returnUrl: string) {
    return this.http
      .post(this.api + '/auth/login', {
        username,
        password,
      })
      .subscribe(
        (result: any) => {
          localStorage.setItem('auth_token', result.data.accessToken);
          localStorage.setItem('ref_token', result.data.refreshToken);
          const expiry = JSON.parse(
            atob(result.data.accessToken.split('.')[1])
          ).exp;
          localStorage.setItem(
            'dayGetToken',
            (Date.now() + expiry - 172800000).toString()
          );
          this.http.get(this.api + '/auth/profile').subscribe(
            (res: any) => {
              if (res.message === 'ERROR') {
                this.logout();
              } else {
                this.userProfile = res.data;
                const permissionsArray = res.data.permissions.map(
                  (permissions:any) => {
                    return permissions;
                  }
                );
                if (permissionsArray.length === 0) {
                  this.toastrService.error('No permission', 'Error', {
                    positionClass: 'toast-top-right',
                  });
                } else if (!permissionsArray.includes('ADMIN_LOGIN')) {
                  this.toastrService.error('No permission', 'Error', {
                    positionClass: 'toast-top-right',
                  });
                } else {
                  this.toastrService.success('Login success', 'Success', {
                    positionClass: 'toast-top-right',
                  });
                  localStorage.setItem('profile', JSON.stringify(res.data));
                  this.permissionsService.loadPermissions(permissionsArray);
                  if (this.redirect.external(returnUrl)) {
                    returnUrl += '?token=' + localStorage.getItem('auth_token');
                  }
                  if (permissionsArray.includes('F_DASHBOARD')) {
                    returnUrl = 'dashboard';
                  } else {
                    returnUrl = 'home';
                  }
                  this.redirect.navigate(returnUrl);
                }
              }
            },
            (error) => {
              this.toastrService.error(error.error.message, 'Error', {
                positionClass: 'toast-top-right',
              });
              return this.logout();
            }
          );
        },
        (error) => {
          this.toastrService.error(error.error.message, 'Error', {
            positionClass: 'toast-top-right',
          });
        }
      );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  public get logIn(): boolean {
    const profile = localStorage.getItem('profile');
    const authToken = localStorage.getItem('auth_token');
    if (profile && authToken) {
      const permissionsArray = JSON.parse(
        localStorage.getItem('profile')||'{}'
      ).permissions;
      if (permissionsArray.includes('ADMIN_LOGIN')) {
        return true;
      }
    }
    return false;
  }

  getToken() {
    return localStorage.getItem('auth_token') || null;
  }
  getRefToken() {
    return localStorage.getItem('ref_token') || null;
  }

  public get getProfileData(): any {
    const userProfile = JSON.parse(localStorage.getItem('profile')||'{}');
    return userProfile;
  }

  forgotPassword(username: string) {
    return this.http.post(this.api + '/auth/activate/resend-code', {
      username,
      type: 'OTP',
    });
  }

  checkOTP(code: string, accountId: string) {
    return this.http.post(this.api + '/auth/check-otp', {
      accountId,
      code,
    });
  }

  changePassword(code: string, accountId: string, newPassword: string) {
    return this.http.post(this.api + '/auth/set-password', {
      accountId,
      code,
      password: newPassword,
    });
  }
}
