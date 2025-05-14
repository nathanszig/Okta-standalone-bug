import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RoutesEnum } from '../../../shared/enum/route.enum';
import { OktaService } from '../../../shared/services/okta.service';
import {
    User,
    UserRole,
    UserService,
} from '../../../shared/services/user.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    public readonly navItems = [
        {
            id: RoutesEnum.PAGE_1.id,
            name: RoutesEnum.PAGE_1.label,
        },
        { id: RoutesEnum.PAGE_2.id, name: RoutesEnum.PAGE_2.label },
    ];

    public user: User | null = null;
    protected readonly UserRole = UserRole;

    constructor(
        public readonly router: Router,
        public readonly userService: UserService,
        public readonly oktaService: OktaService,
    ) {
        this.userService.currentUser$.subscribe((user) => {
            if (!!user) {
                this.user = user;
            }
        });
    }

    protected readonly RoutesEnum = RoutesEnum;
}
