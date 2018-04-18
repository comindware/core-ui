import core from 'coreApi';
import 'jasmine-jquery';

describe('Application', () => {


    describe('Controller', () => {
        it('should initialize', function () {
            const view = core.Controller.extend({
                routingActions: {
                    list: {
                        url: 'SolutionConfigurationApi/List',
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: false }),
                        viewEvents: {

                        }
                    },
                    rolesList: {
                        url: 'RolesCollectionApi/List',
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: false }),
                        viewEvents: {
                            'dblclick:row'(roleId) {

                            },
                            navigateToNewRole() {

                            }
                        }
                    },
                    role: {
                        urlParams: ['Roles'],
                        url: 'RolesCollectionApi/Get',
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: false }),
                        viewEvents: {
                            'update:role:name'() {

                            }
                        }
                    },
                    newRole: {
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: false }),
                        viewEvents: {
                            'update:role:name'() {

                            }
                        }
                    }
                },

                requests: {
                    'create:app': {
                        url: 'SolutionConfigurationApi/Post',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.CREATED')
                        },
                        onSuccess() {

                        }
                    },
                    'get:app': {
                        url: 'SolutionConfigurationApi/Get'
                    },
                    'edit:app': {
                        url: 'SolutionConfigurationApi/Put',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.EDITED')
                        },
                        onSuccess() {

                        }
                    },
                    'delete:apps': {
                        url: 'SolutionConfigurationApi/Delete',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.DELETED'),
                            onFailure: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.NOTSELECTED')
                        },
                        onSuccess() {

                        }
                    },
                    'create:role': {
                        url: 'RolesCollectionApi/Post',
                        notifications: {
                            onSuccess: Localizer.get('SUITEGENERAL.APP.SETTINGS.ROLES.NOTIFICATIONS.CREATED')
                        },
                        onSuccess() {

                        }
                    },
                    'edit:role': {
                        url: 'RolesCollectionApi/Put',
                        notifications: {
                            onSuccess: Localizer.get('SUITEGENERAL.APP.SETTINGS.ROLES.NOTIFICATIONS.EDITED')
                        }
                    },
                    'delete:roles': {
                        url: 'RolesCollectionApi/Delete',
                        notifications: {
                            onSuccess: Localizer.get('SUITEGENERAL.APP.SETTINGS.ROLES.NOTIFICATIONS.DELETED')
                        }
                    },
                    'apply:role': {
                        url: 'RolesCollectionApi/Apply',
                        notifications: {
                            onSuccess: Localizer.get('SUITEGENERAL.APP.SETTINGS.ROLES.NOTIFICATIONS.APPLIED')
                        }
                    },
                    'get:integration': {
                        url: 'SynchronizationApi/Get'
                    },
                    'get:session': {
                        url: 'SynchronizationApi/GetSession',
                        onSuccess() {

                        },
                        onFailure() {

                        }
                    },
                    'getContext:integration': {
                        url: 'SynchronizationApi/GetSolutionContext'
                    },
                    'get:externalTemplates': {
                        url: 'SynchronizationControlApi/GetExternalTemplates'
                    },
                    'edit:integration': {
                        url: 'SynchronizationApi/Put',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.EDITED')
                        },
                        onSuccess() {

                        }
                    },
                    'delete:integrations': {
                        url: 'SynchronizationApi/Delete',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.DELETED'),
                            onFailure: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.NOTSELECTED')
                        },
                        onSuccess() {
                            this.datasetController.reloadData();
                        }
                    },
                    'delete:sessions': {
                        url: 'SynchronizationApi/DeleteSessions',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.DELETED'),
                            onFailure: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.NOTSELECTED')
                        },
                        onSuccess() {
                            this.datasetController.reloadData();
                        }
                    },
                    'run:synchronization': {
                        url: 'SynchronizationControlApi/RunSynchronization',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.SUCCESSRUN'),
                            onFailure: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.FAILEDRUN')
                        }
                    },
                    'create:integration': {
                        url: 'SynchronizationApi/Post',
                        onSuccess() {
                            Core.services.WindowService.closePopup();
                            this.datasetController.reloadData();
                        }
                    }
                }
            });

            const controller = new view({
                config: { id: 'my:module'},
                region: window.application.contentRegion
            });

            //window.application.contentRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
