import extend from '@mfro/promise-extensions';

import { server } from './server';

extend(Promise);
server.start();
