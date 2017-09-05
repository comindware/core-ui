/**
 * Developer: Stepan Burguchev
 * Date: 2/27/2017
 * Copyright: 2009-2017 Stepan Burguchev®
 *       All Rights Reserved
 * Published under the MIT license
 */

import FormFieldAnchor from './form/FormFieldAnchor';
import FormEditorAnchor from './form/FormEditorAnchor';

export function createEditorAnchor(key, options = {}) {
    return new FormEditorAnchor(Object.assign({
        key
    }, options));
}

export function createFieldAnchor(key, options = {}) {
    return new FormFieldAnchor(Object.assign({
        key
    }, options));
}
