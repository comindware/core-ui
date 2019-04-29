import core from 'coreApi';
import { wait } from '../../utils/helpers';
import 'jasmine-jquery';

const toolbarItemType = {
    ACTION: 'Action',
    GROUP: 'Group',
    SPLITTER: 'Splitter',
    POPUP: 'Popup',
    CHECKBOX: 'Checkbox',
    SELECTITEM: 'SelectItem',
    BLINKCHECKBOX: 'BlinkCheckbox',
    SELECTSTATE: 'SelectState',
    HEADLINE: 'Headline'
};

const sampleItems = new Backbone.Collection([
    {
        iconClass: 'plus',
        id: 'create',
        name: 'Create',
        type: toolbarItemType.ACTION,
        severity: 'Normal',
        resultType: 'CustomClientAction',
        context: 'Void'
    },
    {
        name: 'Group',
        class: 'buttonclass',
        dropdownClass: 'dropdownClass',
        order: 5,
        type: toolbarItemType.GROUP,
        iconType: 'Undefined',
        iconClass: 'low-vision',
        severity: 'None',
        items: [
            {
                userCommandId: 'event.1',
                name: 'Delete',
                class: 'buttonClass',
                order: 0,
                type: 'Action',
                iconType: 'Undefined',
                iconClass: 'braille',
                severity: 'None',
                skipValidation: false,
                kind: 'Delete',
                confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' }
            },
            {
                userCommandId: 'event.2',
                name: 'Create',
                order: 1,
                type: 'Action',
                iconType: 'Undefined',
                iconClass: 'wheelchair',
                severity: 'None',
                skipValidation: false,
                kind: 'Create'
            },
            {
                userCommandId: 'event.3',
                name: 'Delete',
                order: 2,
                type: 'Action',
                iconType: 'Undefined',
                severity: 'Low',
                skipValidation: false,
                kind: 'Delete',
                confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' }
            },
            {
                userCommandId: 'event.4',
                name: 'Delete',
                order: 3,
                type: 'Action',
                iconType: 'Undefined',
                severity: 'Fatal',
                skipValidation: false,
                kind: 'Delete',
                confirmation: { id: 'confirmation.27', title: 'New operation', text: 'Confirm operation', yesButtonText: 'Execute', noButtonText: 'Cancel', severity: 'None' }
            }
        ]
    },
    {
        type: toolbarItemType.SPLITTER
    },
    {
        iconType: 'Undefined',
        id: 'themePicker',
        name: 'themePicker',
        severity: 'None',
        defaultTheme: true,
        type: toolbarItemType.POPUP,
        options: {
            collection: new Backbone.Collection(),
            diagramId: '1',
            solutionId: '2',
            buttonView: Marionette.View.extend({ template: false }),
            panelView: Marionette.View.extend({ template: false })
        }
    },
    {
        iconType: 'Undefined',
        type: 'Checkbox',
        id: '6',
        name: 'Check the checkbox',
        severity: 'Critical'
    },
    {
        iconClass: 'Undefined',
        type: 'SelectState',
        id: 'selectStateId',
        name: 'SelectState',
        severity: 'Critical',
        items: [
            {
                id: 'headLine',
                type: 'Headline',
                name: 'some header'
            },
            {
                id: 'firstState',
                iconClass: 'align-left',
                name: 'Left'
            },
            {
                id: 'secondState',
                iconClass: 'align-center',
                name: 'Center'
            },
            {
                id: 'thirdState',
                iconClass: 'align-right',
                name: 'Right'
            },
            {
                id: 'fourthState',
                iconClass: 'align-justify',
                name: 'Justify'
            }
        ]
    },
    {
        id: 'eyes',
        name: 'Eyes',
        kind: 'Const',
        type: 'BlinkCheckbox',
        severity: 'Normal',
        columns: new Backbone.Collection([
            {
                id: 'blink.1',
                name: 'First',
                isHidden: false
            },
            {
                id: 'blink.2',
                name: 'Second',
                isHidden: true
            },
            {
                id: 'blink.3',
                name: 'Third',
                isHidden: false
            }
        ])
    }
]);

describe('Components', () => {
    describe('Toolbar:', () => {
        it('should initialize and be shown', function() {
            const view = new core.components.Toolbar({
                allItemsCollection: new Backbone.Collection()
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(view);

            expect(document.querySelector('.js-toolbar-actions').children.length).toBe(3); // 3 groups: main, menu, const
        });

        it('if items do not fit into the toolbar, they should move to the drop-down menu.', done => {
            const popupView = new core.layout.Popup({
                size: {
                    width: 1500,
                    height: 200
                },
                header: 'My horrible header',
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
                            core.services.WindowService.closePopup();
                        }
                    }
                ],
                content: new core.components.Toolbar({
                    allItemsCollection: sampleItems
                })
            });

            core.services.WindowService.showPopup(popupView);

            wait({
                condition: () => popupView.el.querySelector('.toolbar-items-wrp').children.length,
                callback: () => {
                    popupView.el.style.width = '400px';
                    window.dispatchEvent(new Event('resize'));

                    wait({
                        condition: () => document.querySelector('.toolbar-menu-actions .popout__action-btn'),
                        callback: () => {
                            document.querySelector('.toolbar-menu-actions .popout__action-btn').click();
                            wait({
                                condition: () => document.querySelector('.popout-menu').children.length > 0,
                                callback: () => {
                                    expect(document.querySelector('.popout-menu').children.length).toBe(3);
                                    done();
                                }
                            });
                        }
                    });
                }
            });
        });

        it('shows each of the buttons', done => {
            expect(true).toBe(true); //TODO
            done();
        });

        it('when the model of button was changed, it saves its status, even after update', done => {
            expect(true).toBe(true); //TODO
            done();
        });
    });
});
