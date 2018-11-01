import ButtonView from './ButtonView';
import BlinkCheckboxPopoutPanelView from './blinkCheckbox/BlinkCheckboxPopoutPanelView';

export default Marionette.View.extend({
    constructor(options = {}) {
        _.defaults(options.model.attributes, {
            iconClass: 'eye'
        });
        const view = this.__createView(options);

        const channel = options.model.get('channel');

        channel && view.listenTo(view, 'before:open', () => channel.trigger('columns:before:open'));

        view.listenTo(view, 'panel:save:columns', () => {
            channel && channel.trigger('columns:save:dataset', options.model);
            view.close();
        });

        return view;
    },

    __createView(options) {
        return Core.dropdown.factory.createPopout({
            buttonView: ButtonView,
            panelView: BlinkCheckboxPopoutPanelView,
            customAnchor: true,
            buttonViewOptions: {
                model: options.model
            },
            panelViewOptions: {
                model: options.model
            }
        });
    }
});
