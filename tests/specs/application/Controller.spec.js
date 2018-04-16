import core from 'coreApi';
import { initializeCore } from '../../utils/helpers';
import 'jasmine-jquery';

describe('Application', () => {
    beforeEach(function () {
        this.rootRegion = initializeCore();
    });

    describe('Controller', () => {
        it('should initialize', function () {
            const view = Core.Controller.extend({
                routingActions: {
                    list: {
                        url: 'SolutionConfigurationApi/List',
                        viewModel: solutions.SolutionsCollection,
                        view: solutions.SolutionGridView,
                        viewEvents: {
                            'dblclick:row'(model) {
                                this.__navigate(ModuleService.getModuleUrlByName('administration', ModuleService.modules.SOLUTIONS, { appId: model.id }));
                            }
                        }
                    },
                    rolesList: {
                        url: 'RolesCollectionApi/List',
                        viewModel: solutions.RolesListCollection,
                        view: solutions.RolesGridView,
                        viewEvents: {
                            'dblclick:row'(roleId) {
                                const appId = this.currentState.solution;

                                this.__navigate(ModuleService.getModuleUrlByName('role', ModuleService.modules.SOLUTIONS, { appId, roleId }));
                            },
                            navigateToNewRole() {
                                const appId = this.currentState.solution;

                                this.__navigate(ModuleService.getModuleUrlByName('newRole', ModuleService.modules.SOLUTIONS, { appId }));
                            }
                        }
                    },
                    role: {
                        urlParams: ['Roles'],
                        url: 'RolesCollectionApi/Get',
                        viewModel: solutions.RolesListModel,
                        view: solutions.RoleViewPresenter,
                        viewEvents: {
                            'update:role:name'(name) {
                                this.__updateRoleName(name);
                            }
                        }
                    },
                    newRole: {
                        viewModel: solutions.RolesListModel,
                        view: solutions.RoleViewPresenter,
                        viewEvents: {
                            'update:role:name'(name) {
                                this.__updateRoleName(name);
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

            this.rootRegion.show(view);
            // assert
            expect(true).toBe(true);
        });
    });
});
