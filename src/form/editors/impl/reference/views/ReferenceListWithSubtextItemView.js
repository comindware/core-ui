import ReferenceListItemView from './ReferenceListItemView';
import template from '../templates/referenceListWithSubtextItem.hbs';

export default ReferenceListItemView.extend({
    className: 'subtext-list',

    template: Handlebars.compile(template),

    templateContext() {
        const options = this.options.subTextOptions;
        return {
            text: this.options.getDisplayText(this.model.toJSON()),
            iconType: options.iconProperty ? this.model.get(options.iconProperty).toLocaleLowerCase() : false,
            subtext: this.model.get(options.subtextProperty),
            showCheckboxes: this.options.showCheckboxes
        };
    }
});
