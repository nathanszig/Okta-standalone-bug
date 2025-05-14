import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideRouter, Route } from '@angular/router';
import { OktaAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';
import { AuthGuardService } from './shared/services/auth-guard.service';
import { CanMatchAuthGuard } from './core/services/can-match-auth.guard';
import { RoutesEnum } from './shared/enum/route.enum';
import { Page1 } from './page-1/page-1';


export const routes: Route[] = [
  {
    path: '',
    canActivate: [OktaAuthGuard, AuthGuardService],
    children: [
      {
        path: RoutesEnum.PAGE_1.id,
        component: Page1,
        canMatch: [CanMatchAuthGuard],
      },
    ],
  },
  { path: 'callback', component: OktaCallbackComponent },
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
}).catch((err) => console.error(err));
