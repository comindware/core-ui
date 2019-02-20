import core from 'coreApi';
import 'jasmine-jquery';

describe('Application', () => {
    describe('Controller', () => {
        it('should initialize', () => {
            const view = class extends core.Controller {
                routingActions = {
                    list: {
                        url: 'SolutionConfigurationApi/List',
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: _.noop, }),
                        viewEvents: {}
                    },
                    rolesList: {
                        url: 'RolesCollectionApi/List',
                        viewModel: Backbone.Collection,
                        view: Marionette.View.extend({ template: _.noop, }),
                        viewEvents: {
                            'dblclick:row'(roleId) {},
                            navigateToNewRole() {}
                        }
                    }
                };

                requests = {
                    'create:app': {
                        url: 'SolutionConfigurationApi/Post',
                        onSuccess() {}
                    },
                    'get:app': {
                        url: 'SolutionConfigurationApi/Get'
                    },
                    'edit:app': {
                        url: 'SolutionConfigurationApi/Put',
                        onSuccess() {}
                    }
                };
            };

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

            const view = class extends core.Controller {
                onRoute() {
                    onChangeCallback();
                }

                navigationRoute(id) {
                    onChangeCallback();
                    expect(id).toEqual('1');
                    expect(onChangeCallback).toHaveBeenCalledTimes(2);
                    done();
                }
            };

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
