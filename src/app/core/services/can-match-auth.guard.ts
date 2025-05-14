import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { Route, Router, UrlSegment } from '@angular/router';
import { OktaService } from '../../shared/services/okta.service';
import {
    User,
    UserRole,
    UserService,
} from '../../shared/services/user.service';
import { RoutesEnum } from '../../shared/enum/route.enum';

@Injectable({
    providedIn: 'root',
})
export class CanMatchAuthGuard {
    public user: User | null = null;
    constructor(
        @Inject(OKTA_AUTH) private _oktaAuth: OktaAuth,
        private _oktaService: OktaService,
        private readonly _userService: UserService,
        public router: Router,
    ) {}

    async canMatch(route: Route, segments: UrlSegment[]): Promise<boolean> {
        return this._oktaService
            .isAuthenticated()
            .then(async (isAuthenticated) => {
                if (isAuthenticated) {
                    this._userService.currentUser$.subscribe(
                        (user) => (this.user = user),
                    );
                    if (!this.user) {
                        await this._oktaService.getUser().then((userClaims) => {
                            if (
                                Array.isArray(userClaims['groups']) &&
                                userClaims['groups'].length > 0
                            ) {
                                this._userService.setCurrentUser(
                                    userClaims.name as string,
                                    (userClaims['groups'] as UserRole[])[0],
                                );
                            }
                        });
                        this._userService.currentUser$.subscribe(
                            (user) => (this.user = user),
                        );
                    }
                    if (
                        this.user &&
                        this.user.role === UserRole.Partner &&
                        route.path !== RoutesEnum.PAGE_3.id
                    ) {
                        this.router.navigate([RoutesEnum.PAGE_3.id]);
                        return false;
                    } else if (
                        route.path === RoutesEnum.PAGE_4.id &&
                        (segments.length < 2 || isNaN(Number(segments[1].path)))
                    ) {
                        this.router.navigate([RoutesEnum.PAGE_1.id]);
                        return false;
                    }
                    return true;
                }
                await this._oktaAuth.signInWithRedirect();
                return false;
            });
    }
}
