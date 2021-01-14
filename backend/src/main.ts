import './actions';
import './actions/complete-action';
import './actions/legislature-discard';
import './actions/legislature-veto';
import './actions/nominate';
import './actions/set-action-target';
import './actions/set-ready';
import './actions/submit-vote';


import { server } from './server';

server.start();
