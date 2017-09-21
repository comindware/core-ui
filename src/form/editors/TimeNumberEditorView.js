/**
 * Developer: Kristina
 * Date: 12/22/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from './templates/timeNumberEditor.html';
import formRepository from '../formRepository';
import NumberEditorView from '../editors/NumberEditorView';

formRepository.editors.TimeNumberEditorView = NumberEditorView.extend({
    className: 'field-time',
    template: Handlebars.compile(template)
});

export default formRepository.editors.TimeNumberEditorView;
