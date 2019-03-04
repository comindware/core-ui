import TriggerButtonView from './TriggerButtonView';
import BlinkCheckboxPopoutPanelView from './blinkCheckbox/BlinkCheckboxPopoutPanelView';
import keyCode from '../../../utils/keyCode';

export default Marionette.View.extend({
    constructor(options = {}) {
        const view = this.__createView(options);

        return view;
    },

    __createView(options) {
        const view = Core.dropdown.factory.createPopout({
            buttonView: TriggerButtonView,
            panelView: BlinkCheckboxPopoutPanelView,
            customAnchor: true,
            buttonViewOptions: {
                model: options.model,
                mode: options.mode,
                showName: options.showName
            },
            panelViewOptions: {
                model: options.model,
                mode: options.mode,
                showName: options.showName
            }
        });

        view.listenTo(view, 'panel:save:columns', () => {
            view.trigger('action:click', options.model, { type: 'panel:save:columns' });
            view.close();
        });
        if (options.model.get('triggerBeforeOpen')) {
            view.listenTo(view, 'before:open', () => {
                view.trigger('action:click', options.model, { type: 'before:open' });
            });
        }

        view.listenTo(view, 'keyup', this.__keyup);

        return view;
    },

    __keyup(buttonView, event) {
        if ([keyCode.ENTER, keyCode.SPACE].includes(event.keyCode)) {
            this.open();
        }
    }
});
