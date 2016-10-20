import ReferenceListItemView from './ReferenceListItemView';
import template from '../templates/userReferenceListItem.hbs';
import { Handlebars } from '../../../../../libApi';

export default ReferenceListItemView.extend({
    template: Handlebars.compile(template)
});
