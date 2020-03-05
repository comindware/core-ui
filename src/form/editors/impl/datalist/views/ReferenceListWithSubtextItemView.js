import ReferenceListItemView from './ReferenceListItemView';
import template from '../templates/referenceListWithSubtextItem.hbs';

export default ReferenceListItemView.extend({
    className: 'subtext-list',

    template: Handlebars.compile(template),

    templateContext() {
        const options = this.options.subTextOptions;
        const iconPropertyValue = this.model.get(options.iconProperty);
        const type = iconPropertyValue ? iconPropertyValue.toLocaleLowerCase() : '';
        const iconType = options.metaIcons[type] || null;
        return {
            text: this.options.getDisplayText(this.model.toJSON()),
            iconType,
            subtext: this.model.get(options.subtextProperty),
            showCheckboxes: this.options.showCheckboxes
        };
    }
});
