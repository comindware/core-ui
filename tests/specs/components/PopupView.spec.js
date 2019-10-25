import core from 'coreApi';
import 'jasmine-jquery';

const $ = core.lib.$;

describe('Components', () => {
    afterEach(() => {
        core.services.WindowService.closePopup(null, true);
    });

    describe('PopupView', () => {
        it('should open and close popup on base init', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 700,
                    height: 550
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.VerticalLayout({
                    rows: []
                })
            });

            core.services.WindowService.showPopup(popupView);
            let popupEl = $('.js-core-ui__global-popup-region').find('.js-window');
            expect(popupEl.length).toEqual(1);
            core.services.WindowService.closePopup(null, true);
            popupEl = $('.js-core-ui__global-popup-region').find('.js-window');
            expect(popupEl.length).toEqual(0);
        });

        it('should match it configuration size', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 700,
                    height: 550
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.VerticalLayout({
                    rows: []
                })
            });
            core.services.WindowService.showPopup(popupView);

            const popupEl = $('.js-core-ui__global-popup-region').find('.js-window');

            expect(popupEl.height()).toEqual(550);
            expect(popupEl.width()).toEqual(700);
        });
        /*
        it('should set max width and height if configuration size is bad', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 999999,
                    height: 999999
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.VerticalLayout({
                    rows: []
                })
            });
            core.services.WindowService.showPopup(popupView);
            expect(popupView.$el.height()).toEqual(650);
            expect(popupView.$el.width()).toEqual(980);
        });

        it('should set min width and height if configuration size is bad', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 1,
                    height: 1
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.VerticalLayout({
                    rows: []
                })
            });
            core.services.WindowService.showPopup(popupView);

            expect(popupView.$el.height()).toEqual(150);
            expect(popupView.$el.width()).toEqual(400);
        });
        */
        
        it('should match it configuration header', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 700,
                    height: 550
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.VerticalLayout({
                    rows: []
                })
            });
            core.services.WindowService.showPopup(popupView);

            const header = $('.js-core-ui__global-popup-region').find('.js-window .layout__popup-view-header-text');

            expect(header.html()).toEqual('My beautiful header');
        });

        it('should render it buttons', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 700,
                    height: 550
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.VerticalLayout({
                    rows: []
                })
            });

            core.services.WindowService.showPopup(popupView);
            const buttons = $('.js-core-ui__global-popup-region').find('.js-window .toolbar-btn__text');

            expect(buttons.length).toEqual(2);
        });

        it('should render it content', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 700,
                    height: 550
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.VerticalLayout({
                    rows: []
                })
            });

            core.services.WindowService.showPopup(popupView);
            const content = $('.js-core-ui__global-popup-region').find('.js-window .js-content-region');

            expect(content.html()).not.toEqual('');
        });

        
        it('should set correct loading', () => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 700,
                    height: 550
                },
                header: 'My beautiful header',
                buttons: [
                    {
                        id: 'accept',
                        text: 'Accept',
                        handler: popup => {
                            popup.trigger('save');
                        }
                    },
                    {
                        id: 'reject',
                        text: 'Reject',
                        handler() {
                            core.services.WindowService.closePopup(null, true);
                        }
                    }
                ],
                content: new core.layout.TabLayout({
                    tabs: [
                        {
                            id: 'tab1',
                            name: 'Tab 1',
                            view: new core.form.editors.TextAreaEditor({
                                value: 'Content 1'
                            })
                        },
                        {
                            id: 'tab2',
                            name: 'Tab 2',
                            enabled: false,
                            view: new core.form.editors.TextAreaEditor({
                                value: 'Content 2'
                            })
                        }
                    ]
                })
            });

            core.services.WindowService.showPopup(popupView);

            popupView.setLoading(true);

            const loading = popupView.ui.window.children().first();
            expect(loading).not.toBeEmpty('loader is empty');

            const loadingMask = loading.children(':first-child');
            expect(loadingMask.width()).toEqual(700, 'loading mask has other width');
            expect(loadingMask.height()).toEqual(550, 'loading mask has other height');

            popupView.setLoading(false);
            expect(loading).toBeEmpty('loader is not empty');

            popupView.destroy();
            popupView.setLoading(true);
            expect(loading).toBeEmpty('loader must be empty after destroy');
        });
    });
});
