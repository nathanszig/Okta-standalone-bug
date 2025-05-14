import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Config } from '../types/config/config';

const CONFIG_URL = 'config.env.json';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private httpClient: HttpClient;
    private _config!: Config;

    constructor(private handler: HttpBackend) {
        this.httpClient = new HttpClient(handler);
    }

    public loadConfigurationFile(): Promise<Config> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(CONFIG_URL).subscribe({
                next: (config) => {
                    this._config = config as Config;
                    resolve(this._config);
                },
                error: (error) => reject(error),
            });
        });
    }

    public getConfig(): Config {
        return this._config as Config;
    }
}
