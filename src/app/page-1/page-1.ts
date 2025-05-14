import { Component, OnInit, ViewChild } from '@angular/core';
import { User, UserRole, UserService } from '../shared/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-page-1',
    imports: [
        CommonModule,
    ],
    templateUrl: './page-1.html',
    styleUrl: './page-1.scss',
})
export class Page1 implements OnInit {
    public todoDailyCount: number = 0;
    public totalDailyCount: number = 0;
    public userDailyCount: number = 0;
    public toMergeCount: number = 0;

    public user: User | null = null;
    protected readonly UserRole = UserRole;

    constructor(
        private _userService: UserService,
    ) {
        this._userService.currentUser$.subscribe((user) => {
            if (!!user) {
                this.user = user;
            }
        });
    }

    ngOnInit() {

    }

    protected readonly String = String;
}
