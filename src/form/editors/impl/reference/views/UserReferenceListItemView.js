import ReferenceListItemView from './ReferenceListItemView';
import template from '../templates/userReferenceListItem.hbs';
import { Handlebars } from 'lib';

export default ReferenceListItemView.extend({
    template: Handlebars.compile(template)
});
