import { Inject, Injectable } from '@angular/core';

import { OKTA_AUTH } from '@okta/okta-angular';

import { from, Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { UserRole, UserService } from './user.service';
import OktaAuth from '@okta/okta-auth-js';
import { OktaService } from './okta.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService {
    constructor(
        @Inject(OKTA_AUTH) private _oktaAuth: OktaAuth,
        private _oktaService: OktaService,
        private _userService: UserService,
    ) {}

    public canActivate(): boolean | Observable<boolean> {
        return this.checkUserAccess().pipe(map(() => true));
    }

    public checkUserAccess(): Observable<boolean> {
        return this._userService.currentUser$.pipe(
            switchMap((currentUser) =>
                currentUser
                    ? of(true)
                    : from(this._oktaService.isAuthenticated()).pipe(
                          switchMap((isAuthenticated) =>
                              isAuthenticated
                                  ? from(this._oktaService.getUser()).pipe(
                                        catchError((error) => {
                                            if (error) {
                                                this._oktaAuth.signInWithRedirect();
                                            }
                                            throw error;
                                        }),
                                        tap((userClaims) => {
                                            if (
                                                Array.isArray(
                                                    userClaims['groups'],
                                                ) &&
                                                userClaims['groups'].length > 0
                                            ) {
                                                this._userService.setCurrentUser(
                                                    userClaims.name as string,
                                                    (
                                                        userClaims[
                                                            'groups'
                                                        ] as UserRole[]
                                                    )[0],
                                                );
                                            }
                                        }),
                                        switchMap((userClaims) =>
                                            userClaims['groups']
                                                ? of(true)
                                                : of(false),
                                        ),
                                    )
                                  : of(false),
                          ),
                      ),
            ),
        );
    }
}
