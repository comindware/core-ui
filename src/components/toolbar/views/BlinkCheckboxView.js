import TriggerButtonView from './TriggerButtonView';
import BlinkCheckboxPopoutPanelView from './blinkCheckbox/BlinkCheckboxPopoutPanelView';
import keyCode from '../../../utils/keyCode';

export default class BlinkCheckboxView {
    constructor(options = {}) {
        const view = this.__createView(options);

        view.model = options.model;
        return view;
    }

    __createView(options) {
        const view = Core.dropdown.factory.createPopout({
            buttonView: TriggerButtonView,
            panelView: BlinkCheckboxPopoutPanelView,
            customAnchor: true,
            buttonViewOptions: {
                model: options.model
            },
            panelViewOptions: {
                model: options.model
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

        view.listenTo(view, 'button:keyup', this.__keyup);

        return view;
    }

    __keyup(buttonView, event) {
        if ([keyCode.ENTER, keyCode.SPACE].includes(event.keyCode)) {
            this.open();
        }
    }
}
