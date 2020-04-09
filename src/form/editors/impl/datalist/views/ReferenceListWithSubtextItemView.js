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
        const iconLink = options.metaIcons.goTo;
        return {
            text: this.options.getDisplayText(this.model.toJSON()),
            iconType,
            iconLink,
            subtext: this.model.get(options.subtextProperty),
            showCheckboxes: this.options.showCheckboxes,
            url: this.options.model.get('url')
        };
    }
});
