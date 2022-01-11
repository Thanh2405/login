import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  api = environment.apiUrl;
  constructor(
    public auth: AuthService,
    private authService: AuthService,
    private toastrService: ToastrService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      request.url.includes(this.api + '/auth/access-token') &&
      this.auth.getRefToken() !== null
    ) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getRefToken()}`,
        },
      });
    } else if (this.auth.getToken() !== null) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.getToken()}`,
        },
      });
    }

    return next.handle(request).pipe(
      tap(
        () => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.authService.logout();
            } else if (err.status === 403) {
              this.toastrService.error('Forbidden resource', 'Error', {
                positionClass: 'toast-top-right',
              });
            }
            return;
          }
        }
      )
    );
  }
}
