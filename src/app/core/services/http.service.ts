import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
    HttpErrorResponse,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from '@angular/common/http';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { Observable, from, of, throwError, retry } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';

import { OktaService } from '../../shared/services/okta.service';
import { ConfigService } from '../../shared/services/config.service';

const DELAY_BEFORE_SHOWING_LOADER = 150; // ms

@Injectable({
    providedIn: 'root',
})
export class HttpService implements HttpInterceptor, OnDestroy {
    private _totalRequests = 0;
    private _timeout: any;

    /**
     * WARNING: To prevent a circular injection dependency, ensure
     *          that the injected services don't depend on HTTPClient.
     *          If they do, you can replace HTTPClient by HTTPBackend.
     *          See: https://stackoverflow.com/a/49013534
     *          From this angular issue: https://github.com/angular/angular/issues/23279
     */
    constructor(
        @Inject(OKTA_AUTH) private _oktaAuth: OktaAuth,
        private _oktaService: OktaService,
        private _config: ConfigService,
    ) {
        this._oktaAuth.tokenManager.on('error', () => {
            this._oktaService.signOut();
        });
    }

    ngOnDestroy(): void {
        this._oktaAuth.tokenManager.off('error');
    }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        this._totalRequests++;
        if (this._timeout) {
            clearTimeout(this._timeout);
        }

        this._timeout = setTimeout(() => DELAY_BEFORE_SHOWING_LOADER);

        return this._handleAccess(request, next).pipe(
            finalize(() => {
                this._totalRequests--;

                if (this._totalRequests === 0) {
                    if (this._timeout) {
                        clearTimeout(this._timeout);
                    }
                }
            }),
        );
    }

    private _handleAccess(
        request: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        return of(null).pipe(
            switchMap(() => from(this._oktaService.isAuthenticated())),
            tap((isAuthenticated: boolean) => {
                if (
                    !isAuthenticated &&
                    !request.url.startsWith('assets/images/icons/')
                ) {
                    throw 'Okta is not ready yet';
                }

                // Only add an access token to whitelisted origins
                let allowedOrigins = ['http://localhost'];
                allowedOrigins = allowedOrigins.concat(
                    this._config.getConfig()['allowed-origins'],
                );
                if (
                    allowedOrigins.some((url) =>
                        request.urlWithParams.includes(url),
                    )
                ) {
                    const accessToken = this._oktaService.getAccessToken();
                    request = request.clone({
                        setHeaders: {
                            Authorization: 'Bearer ' + accessToken,
                        },
                    });
                }
            }),
            retry({ delay: 500 }),
            switchMap(() => next.handle(request)),
            catchError((error) => this._handleAuthError(error)),
        );
    }

    private _handleAuthError(error: HttpErrorResponse): Observable<any> {
        if (error.status === 401) {
            this._oktaAuth.signInWithRedirect();
            return of(error.message);
        }
        return throwError(() => error);
    }
}
