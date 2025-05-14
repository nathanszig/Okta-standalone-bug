import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  OktaAuthModule,
  OKTA_CONFIG,
} from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { ConfigService } from './shared/services/config.service';
import { UserService } from './shared/services/user.service';
import { OktaService } from './shared/services/okta.service';
import {HttpService} from './core/services/http.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideAppInitializer(() => {
      const initializerFn = ((config: ConfigService) => () => {
        return config.loadConfigurationFile();
      })(inject(ConfigService));
      return initializerFn();
    }),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom([
      OktaAuthModule,
    ]),
    {
      provide: OKTA_CONFIG,
      useFactory: (config: ConfigService) => {
        return { oktaAuth: new OktaAuth(config.getConfig().okta) };
      },
      deps: [ConfigService],
    },
    { provide: HTTP_INTERCEPTORS, useClass: HttpService, multi: true },
    ConfigService,
    OktaService,
    UserService
  ],
};
