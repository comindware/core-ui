/**
 * Developer: Stepan Burguchev
 * Date: 2/29/2016
 * Copyright: 2009-2016 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

"use strict";

import '../../dist/styles.bundle.css';
import 'styles/demo.css';
import 'lib/prism/prism.css';

import Application from './Application';
import AppRouter from './AppRouter';
import AppController from './AppController';

Application.appRouter = new AppRouter({
    controller: new AppController()
});

Application.start();
Backbone.history.start();
