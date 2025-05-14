import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export enum UserRole {
    Admin = 'ROLE_NETWORK_ADMIN',
    Partner = 'ROLE_BUSINESS_PARTNER',
}

const USER_ROLES = Object.values(UserRole);

export type User = {
    name: string;
    role: UserRole;
};

@Injectable({
    providedIn: 'root',
})
export class UserService {
    public name: string = '';
    public groups: string = '';
    public readonly currentUser$ = new BehaviorSubject<User | null>(null);

    constructor() {}

    public setCurrentUser(name: string, role: UserRole): void {
        if (USER_ROLES.indexOf(role) !== -1) {
            const currentUser = {
                name: name,
                role: role,
            };
            this.currentUser$.next(currentUser);
        }
    }
}
