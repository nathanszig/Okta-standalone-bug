import { Inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth, { UserClaims } from '@okta/okta-auth-js';

@Injectable({
    providedIn: 'root',
})
export class OktaService {
    constructor(
        private _userService: UserService,
        @Inject(OKTA_AUTH) private readonly _oktaAuth: OktaAuth,
    ) {}

    public getUser(): Promise<UserClaims> {
        return this._oktaAuth.getUser();
    }

    public isAuthenticated(): Promise<boolean> {
        return this._oktaAuth.isAuthenticated();
    }

    public getAccessToken(): string | undefined {
        return this._oktaAuth.getAccessToken();
    }

    public signOut(): void {
        this._userService.currentUser$.next(null!);
        this._oktaAuth.signOut();
        this._oktaAuth.signInWithRedirect();
    }
}
