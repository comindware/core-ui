
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const collection = new Backbone.Collection(core.services.UserService.listUsers(), {
        comparator: core.utils.helpers.comparatorFor(core.utils.comparators.stringComparator2Asc, 'name')
    });

    /* В реальном коде ОБЯЗАТЕЛЬНО следуйте правилу "одна View - один файл", не объявляйте их инлайном. */

    const DemoDropdownItemView = Marionette.View.extend({
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

    const DemoButtonView = Marionette.View.extend({
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

    const dropdown = core.dropdown.factory.createDropdown({
        buttonView: DemoButtonView,
        panelView: DemoDropdownPanelView,
        panelViewOptions: {
            collection
        }
    });

    return new CanvasView({
        view: dropdown,
        canvas: {
            width: '300px'
        }
    });
}
