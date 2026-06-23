import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { init as initApm } from '@elastic/apm-rum';

import { AppModule } from './app/app.module';

initApm({
  serviceName: 'student-frontend',
  serverUrl: 'http://10.70.34.118:8200',
  serviceVersion: '0.0.1',
  environment: 'dev',
  distributedTracingOrigins: ['http://10.70.34.118:8080'],
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
