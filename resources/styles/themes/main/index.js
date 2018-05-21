/*eslint-env node*/
const variables = {
    // colors
    red: '#cb4e30',
    'blue-100': '#278ed9',
    'blue-200': '#0575bd',

    'grey-100': '#f3f3f3',
    'grey-200': '#edeff0',
    'grey-300': '#d2dbe2',
    'grey-400': '#d3d5d6;',
    'grey-500': '#b9bcbd',
    'grey-600': '#aab5be',
    'grey-700': '#70787F',
    'grey-800': '#838c92',

    'text-color': '#384650',
    'error-color': 'var(--red)',

    // font
    font: "normal 12px/1.4 Arial, 'OpenSans', sans-serif",

    // form editor
    'editor-height': '20px',
    'editor-textarea-height': 'auto',
    'editor-line-height': '20px',
    'editor-textarea-line-height': '18px',
    'editor-font-size': '12px',
    'editor-text-color': 'var(--text-color)',
    'editor-empty-text-color': 'var(--grey-400)',
    'editor-focused-text-color': 'var(--text-color)',

    // input
    'input-padding': '0 20px 0 0',
    'input-height': 'inherit',
    'input-line-height': 'inherit',
    'input-hover-color': 'var(--grey-500)',

    // textarea
    'textarea-padding': '0 0 2px',
    'textarea-line-height': 'inherit',
    'textarea-min-height': '26px',

    // custom control
    'custom-control-spacer-y': '0',

    // checkbox
    'checkbox-size': '16px',
    'checkbox-radius': '2px',
    'checkbox-border-color': 'var(--grey-800)',
    'checkbox-intermediate-color': 'var(--blue-100)',
    'checkbox-intermediate-size': '8px',

    // radio
    'radio-size': '12px',
    'radio-right-margin': '5px',
    'radio-checked-color': 'var(--blue-200)',
    'radio-inner-size': '6px',
    'radio-checked-disabled-color': 'var(--grey-700)',

    // svg-icons
    'svg-icon-right': '0',
    'svg-icon-top': '0',
    'svg-icon-width': '16px',
    'svg-icon-height': '16px',
    'svg-icon-transform': 'none'
};

module.exports.variables = variables;

// postcss apply добавляет правила по очереди в начало (prepend), что бы не переопределить свойства которые присутствуют изначально, в связи с этим приходится писать свойства в обратном порядке если нам нужно сначала сбросить свойство, а потом добавить его частично(https://github.com/pascalduez/postcss-apply/issues/43)

module.exports.apply = {
    'input-theme': {
        'border-bottom': `1px solid ${variables['grey-200']}`,
        border: '0'
    },
    'input-disabled-theme': {
        'border-bottom-color': 'transparent',
        background: 'none'
    },
    'textarea-theme': {
        'border-bottom': `1px solid ${variables['grey-200']}`,
        border: '0'
    },
    'custom-cotrol-disabled-theme': {
        filter: 'alpha(opacity=60)',
        opacity: '.6',
        cursor: 'auto'
    },
    'check-button-disabled-theme': {},
    'radio-disabled-theme': {}
};
