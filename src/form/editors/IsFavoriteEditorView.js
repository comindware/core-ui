/**
 * Developer: Stepan Burguchev
 * Date: 10/13/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from './templates/isFavoriteEditor.html';
import formRepository from '../formRepository';
import BooleanEditor from '../editors/BooleanEditorView';

formRepository.editors.IsFavourite = BooleanEditor.extend({
    template: Handlebars.compile(template)
});

export default formRepository.editors.IsFavourite;
