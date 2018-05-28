import '../node_modules/font-awesome/css/font-awesome.css';
import '../../dist/core.css';
import '../../dist/themes/new/theme.css';
import 'styles/demo.css';
import 'lib/prism/prism.css';
import core from 'comindware/core';

const root = typeof global !== 'undefined' ? global : window;

root.core = core;

import Application from './Application';
import AppRouter from './AppRouter';
import AppController from './AppController';

Application.appRouter = new AppRouter({
    controller: new AppController()
});
const app = new Application();
window.app = app;
app.start();
