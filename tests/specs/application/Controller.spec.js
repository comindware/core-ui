import core from 'coreApi';
import 'jasmine-jquery';

describe('Application', () => {
    describe('Controller', () => {
        it('should initialize', () => {
            const view = core.Controller.extend({
                routingActions: {
                    list: {
                        url: 'SolutionConfigurationApi/List',
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: false }),
                        viewEvents: {}
                    },
                    rolesList: {
                        url: 'RolesCollectionApi/List',
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: false }),
                        viewEvents: {
                            'dblclick:row'(roleId) { },
                            navigateToNewRole() { }
                        }
                    }
                },

                requests: {
                    'create:app': {
                        url: 'SolutionConfigurationApi/Post',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.CREATED')
                        },
                        onSuccess() { }
                    },
                    'get:app': {
                        url: 'SolutionConfigurationApi/Get'
                    },
                    'edit:app': {
                        url: 'SolutionConfigurationApi/Put',
                        notifications: {
                            onSuccess: Localizer.get('PROCESS.COMMON.SOLUTIONS.NOTIFICATIONS.EDITED')
                        },
                        onSuccess() { }
                    }
                }
            });

            const controller = new view({
                config: { id: 'my:module' },
                region: window.app.getView().getRegion('contentRegion')
            });

            //window.app.getView().getRegion('contentRegion').show(view);
            // assert
            expect(true).toBe(true);
        });

        it('should call onRoute method and a correct navigation method', done => {
            const onChangeCallback = jasmine.createSpy('onChangeCallback');

            const view = core.Controller.extend({
                onRoute() {
                    onChangeCallback();
                },

                navigationRoute(id) {
                    onChangeCallback();
                    expect(id).toEqual('1');
                    expect(onChangeCallback).toHaveBeenCalledTimes(2);
                    done();
                }
            });

            const config = {
                id: 'my:module',
                module: view,
                navigationUrl: {
                    default: 'testUrl/:id'
                },
                routes: {
                    'testUrl/:id': 'navigationRoute'
                }
            };

            core.RoutingService.initialize({ modules: [config] });
            core.RoutingService.navigateToUrl('testUrl/1');
        });
    });
});
