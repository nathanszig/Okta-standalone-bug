import { OktaConfig } from './oktaConfig';

export interface Config {
    okta: OktaConfig;
    'allowed-origins': string[];
}
