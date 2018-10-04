import 'styles/defaultFontawesome.css';
import '../node_modules/@fortawesome/fontawesome-free/css/fontawesome.css';
import '../node_modules/@fortawesome/fontawesome-free/css/solid.css';
import '../../dist/Core.css';
import 'styles/demo.css';
import 'lib/prism/prism.css';
import Core from 'comindware/core';

const root = typeof global !== 'undefined' ? global : window;

root.Core = Core;

import Application from './Application';
import AppRouter from './AppRouter';
import AppController from './AppController';

Application.appRouter = new AppRouter({
    controller: new AppController()
});
const app = new Application();
window.app = app;
app.start();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
