/**
 * Developer: Kristina
 * Date: 01/16/2015
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from './templates/simpleNumberEditor.html';
import formRepository from '../formRepository';
import NumberEditorView from '../editors/NumberEditorView';

formRepository.editors.SimpleNumberEditorView = NumberEditorView.extend({
    className: 'field-number',
    template: Handlebars.compile(template)
});

export default formRepository.editors.SimpleNumberEditorView;
