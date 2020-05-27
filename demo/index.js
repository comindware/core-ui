import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './styles';
import core from 'comindware/core';

window.Core = core;

import Application from './Application';
import AppRouter from './AppRouter';
import AppController from './AppController';

Application.appRouter = new AppRouter({
    controller: AppController
});

const app = new Application();
window.app = app;
app.once('before:start', () => (AppController.contentView = window.app.getView()));
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
