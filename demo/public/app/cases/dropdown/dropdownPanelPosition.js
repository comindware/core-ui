
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const collection = new Backbone.Collection(core.services.UserService.listUsers(), {
        comparator: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'name')
    });

    const DemoButtonView = Marionette.ItemView.extend({
        template() {
            return Handlebars.compile('<input type="text" class="field js-input" placeholder="Enter text here">');
        },
        onRender() {
            this.$('.js-input').css({
                width: '100%',
                'box-sizing': 'border-box'
            });
        }
    });

    const DemoDropdownItemView = Marionette.ItemView.extend({
        template: Handlebars.compile('{{name}}'),
        className: 'dropdown-list__i'
    });

    const DemoDropdownPanelView = Marionette.CollectionView.extend({
        childView: DemoDropdownItemView,
        className: 'dropdown-list',
        onRender() {
            this.$el.css({
                'overflow-y': 'auto'
            });
        }
    });

    /*
      Possible panelPosition values:
         'down',
         'down-over',
         'up',
         'up-over'
    */

    const dropdown = core.dropdown.factory.createDropdown({
        buttonView: DemoButtonView,
        panelView: DemoDropdownPanelView,
        panelViewOptions: {
            collection
        },
        panelPosition: 'down-over'
    });

    return new CanvasView({
        view: dropdown,
        canvas: {
            width: '300px'
        }
    });
}
