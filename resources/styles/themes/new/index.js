/*eslint-env node*/

const variables = {
    // colors
    red: '#e1462c',

    'grey-100': '#f5f5f5',
    'grey-200': '#efefef',
    'grey-300': '#e2e2e2',
    'grey-400': '#c1c1c1',

    'blue-100': '#d6e7f2',
    'blue-200': '#90c3eb',
    'blue-300': '#0575bd',
    'blue-400': '#04619d',
    'text-color': '#404040',
    'error-color': 'var(--red)',

    'light-gradient': 'linear-gradient(#ffffff 35%, #e9e9e9)',

    // font
    font: "normal 14px/1.4 'OpenSans', Arial, sans-serif",

    // form editor
    'editor-height': 'auto',
    'editor-textarea-height': 'var(--editor-height)',
    'editor-line-height': 'inherit',
    'editor-textarea-line-height': 'inherit',
    'editor-font-size': 'inherit',
    'editor-text-color': 'var(--text-color)',
    'editor-empty-text-color': 'var(--text-color)',
    'editor-focused-text-color': 'var(--text-color)',

    // input
    'input-padding': '0 20px 0 10px',
    'input-height': 'auto',
    'input-line-height': '1.95',
    'input-active-border-color': 'var(--blue-300)',
    'input-error-color': 'var(--red)',

    // textarea
    'textarea-padding': '15px 10px 15px 10px',
    'textarea-line-height': 'inherit',
    'textarea-min-height': '45px',

    // custom control
    'custom-control-spacer-y': '10px',

    // checkbox
    'checkbox-size': '18px',
    'checkbox-checked-color': 'var(--blue-300)',
    'checkbox-border-color': 'var(--grey-400)',
    'checkbox-radius': '0',
    'checkbox-intermediate-color': 'var(--blue-200)',
    'checkbox-intermediate-size': '10px',

    // radio
    'radio-size': 'var(--checkbox-size)',
    'radio-right-margin': '10px',
    'radio-checked-color': 'var(--checkbox-checked-color)',
    'radio-inner-size': '10px',
    'radio-checked-disabled-color': 'var(--blue-300)',

    // svg-icons
    'svg-icon-right': '5px',
    'svg-icon-top': '50%',
    'svg-icon-width': '20px',
    'svg-icon-height': '20px',
    'svg-icon-transform': 'translateY(-50%)'
};

module.exports.variables = variables;

module.exports.apply = {
    'input-theme': {
        border: `1px solid ${variables['grey-400']}`
    },
    'input-disabled-theme': {},
    'textarea-theme': {
        border: `1px solid ${variables['grey-400']}`
    },
    'custom-cotrol-disabled-theme': {
        filter: 'alpha(opacity=60)',
        opacity: '.6',
        cursor: 'not-allowed'
    },
    'check-button-disabled-theme': {
        'border-color': variables['blue-200'],
        background: variables['blue-200']
    },
    'radio-disabled-theme': {
        background: variables['blue-200']
    }
};
