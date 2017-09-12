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

import template from './templates/titleTextEditor.html';
import formRepository from '../formRepository';
import TextEditorView from '../editors/TextEditorView';

formRepository.editors.TitleText = TextEditorView.extend({
    className: 'editor',
    template: Handlebars.compile(template)
});

export default formRepository.editors.TitleText;
