/**
 * Developer: Stepan Burguchev
 * Date: 12/15/2014
 * Copyright: 2009-2014 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

import template from './templates/booleanSwitchEditor.html';
import formRepository from '../formRepository';
import BooleanEditorView from '../editors/BooleanEditorView';

formRepository.editors.BooleanSwitch = BooleanEditorView.extend({
    template: Handlebars.compile(template),

    className: 'boolean-switch-editor__view'
});

export default formRepository.editors.BooleanSwitch;
