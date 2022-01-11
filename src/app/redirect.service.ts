import { Inject,Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

export interface RedirectionExtras extends NavigationExtras {
  target?: string;
}
@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  constructor(
    readonly router: Router,
    @Inject(DOCUMENT) readonly document: Document
  ) {}

  get window(): Window {
    return this.document.defaultView as any;
  }

  public external(url: string): boolean {
    return /^http(?:s)?:\/{2}\S+$/.test(url);
   
  }

  public redirect(url: string, target = '_self'): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        resolve(!!this.window.open(url, target));
      } catch (e) {
        reject(e);
      }
    });
  }

  public navigate(url: string, extras?: RedirectionExtras): Promise<boolean> {
    return this.external(url)
      ? // Redirects to external link
        this.redirect(url, extras && extras.target)
      : // Navigates with the router otherwise
        this.router.navigateByUrl(url, extras);
  }
}