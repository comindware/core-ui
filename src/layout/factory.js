// @flow
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
