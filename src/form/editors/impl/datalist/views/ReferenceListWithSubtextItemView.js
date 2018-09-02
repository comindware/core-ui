import ReferenceListItemView from './ReferenceListItemView';
import template from '../templates/referenceListWithSubtextItem.hbs';

export default ReferenceListItemView.extend({
    className: 'subtext-list',

    template: Handlebars.compile(template),

    templateContext() {
        return {
            text: this.options.getDisplayText(this.model.toJSON()),
            iconType: this.model.get(this.options.subTextOptions.displayAttributeType).toLocaleLowerCase(),
            subtext: this.model.get(this.options.subTextOptions.displayAttributeSubtext),
            showCheckboxes: this.options.showCheckboxes
        };
    }
});
