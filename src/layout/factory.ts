import FormFieldAnchor from './form/FormFieldAnchor';

export function createEditorAnchor(key: string, options: {} = {}) {
    return new FormFieldAnchor(
        Object.assign(
            {
                key,
                kind: 'editor'
            },
            options
        )
    );
}

export function createFieldAnchor(key: string, options: {} = {}) {
    return new FormFieldAnchor(
        Object.assign(
            {
                key,
                kind: 'field'
            },
            options
        )
    );
}
