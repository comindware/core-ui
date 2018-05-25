/*eslint-env node*/

const variables = {
    // colors
    white: '#ffffff',
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
    'main-color': 'var(--blue-300)',
    'error-color': 'var(--red)',
    'selected-color': 'var(--grey-100)',

    'light-gradient': 'linear-gradient(#ffffff 35%, #e9e9e9)',

    // font
    'base-font-size': '14px',
    font: "normal var(--base-font-size)/1.4 'OpenSans', Arial, sans-serif",

    // form editor
    'editor-font-size': 'inherit',
    'editor-text-color': 'var(--text-color)',
    'editor-empty-text-color': 'var(--text-color)',

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

    // grid
    'grid-checkbox-size': '16px',
    'grid-checkbox-icon-size': '12px',
    'grid-header-font-size': 'var(--base-font-size)',
    'grid-header-color': 'var(--white)',
    'grid-header-bg': 'var(--blue-300)',
    'grid-header-border-color': 'var(--grid-header-bg)',
    'grid-header-height': '35px',
    'grid-header-padding': '0 10px 0 15px',
    'grid-header-border': 'inset -1px 0 0 0 var(--blue-200), inset 0 1px 0 0 var(--grid-header-border-color)',
    'grid-header-border-first': 'inset -1px 0 0 0 var(--blue-200), inset 1px 1px 0 0 var(--grid-header-border-color)',
    'grid-header-border-last': 'inset -1px -1px 0 0 var(--grid-header-border-color), inset 0 1px 0 0 var(--grid-header-border-color)',
    'grid-header-selection-bg': 'var(--grid-header-bg)',

    'grid-cell-bg': 'var(--white)',
    'grid-cell-border': 'inset -1px -1px 0 0 var(--grey-400)',
    'grid-cell-border-first': 'inset -1px -1px 0 0 var(--grey-400), inset 1px 0 0 0 var(--grey-400)',
    'grid-cell-height': 'var(--grid-header-height)',
    'grid-cell-padding': '0 15px',
    'grid-row-selected-color': 'var(--blue-100)',
    'grid-row-hover-color': 'var(--grid-row-selected-color)',

    'grid-selection-color': 'var(--grey-400)',
    'grid-selection-width': '50px',
    'grid-selection-bg': 'var(--grid-cell-bg)',
    'grid-selection-index-width': '58px',
    'grid-selection-index-padding-x': '10px',

    'grid-dots-width': 'var(--grid-selection-index-width)',
    'grid-dots-padding': '0 20px 0 4px',
    'grid-dots-color': 'var(--blue-200)',

    'grid-sort-icon-size': 'var(--base-font-size)',
    'grid-sort-icon-offset-y': '1px',
    'grid-sort-icon': "url(\"data:image/svg+xml,%3Csvg fill='var(--white)' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath d='M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z'/%3E%3C/svg%3E\")".replace(
        /#/g,
        '%23'
    ),

    'columns-select-border': '1px solid var(--grey-400)',
    'columns-select-cell-border': 'inset -1px -1px 0 0 var(--grey-400)',

    'dropdown-font-size': 'var(--base-font-size)',
    'dropdown-item-padding': '8px 20px',
    'dropdown-item-checkbox-padding': '10px',
    'dropdown-item-hover-color': 'var(--blue-100)'
};

module.exports.variables = variables;

module.exports.apply = {
    'input-theme': {
        border: `1px solid ${variables['grey-400']}`
    },
    'input-disabled-theme': {
        'background-color': variables['grey-100']
    },
    'textarea-theme': {
        border: `1px solid ${variables['grey-400']}`
    },
    'custom-cotrol-disabled-theme': {
        filter: 'alpha(opacity=60)',
        opacity: '.6',
        cursor: 'not-allowed'
    },
    'checkbox-disabled-theme': {
        color: variables['blue-300'],
        'border-color': variables['blue-200'],
        background: variables['blue-200']
    },
    'radio-disabled-theme': {
        background: variables['blue-200']
    },
    'svg-icon-wrp-theme': {
        right: '5px',
        top: '50%',
        width: '1em',
        height: '1em',
        'line-height': '1em',
        transform: 'translateY(-50%)'
    },
    'svg-icons-theme': {
        width: '1em',
        height: '1em',
        fill: 'currentColor',
        'pointer-events': 'none'
    }
};
