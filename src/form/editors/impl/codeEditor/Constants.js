/**
 * Developer: Stanislav Guryev
 * Date: 02.02.2017
 * Copyright: 2009-2017 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

export default {
    classes: {
        maximized: 'dev-codemirror-maximized',
        highlighted: 'dev-code-editor-highlighted-item',
        function: 'dev-code-editor-function',
        user: 'dev-code-editor-user',
        literal: 'dev-code-editor-literal',
        operator: 'dev-code-editor-operator',
        attribute: 'dev-code-editor-attribute',
        template: 'dev-code-editor-template',
        colorWarning: 'dev-code-editor-warning',
        colorError: 'dev-code-editor-error',
        hintCodemirror: 'CodeMirror-hint'
    },

    originChange: {
        paste: 'paste',
        inputPlus: '+input'
    },

    types: {
        function: 'function',
        user: 'user',
        literal: 'literal',
        operator: 'operator',
        attribute: 'attribute',
        template: 'template'
    },

    mode: {
        script: 'script',
        expression: 'expression',
        notation3: 'notation3'
    },

    languages: {
        expression: 'text/comindware_expression',
        script: 'text/x-csharp',
        notation3: 'text/turtle'
    },

    typeScript: {
        script: 'CSharp',
        expression: 'expression',
        notation3: 'N3Query'
    },

    autoCompleteContext: {
        functions: 'functions',
        users: 'users',
        literals: 'literals',
        operators: 'operators',
        attributes: 'attributes',
        templates: 'templates'
    },

    activeSymbol: {
        dollar: '$',
        arrayRight: '->',
        rightAngleBracket: '>',
        openParenthesis: '(',
        dbArrayRight: 'db->',
        point: '.'
    },

    activeSymbolNotation3: {
        colon: ':',
        questionMark: '?',
        at: '@',
        openBracket: '(',
        closeBracket: ')',
        openBrace: '{',
        closeBrace: '}'
    },

    tokenTypes: {
        identifier: 'identifier',
    },

    queryCompleteHoverType: {
        completion: 'Completion',
        unusedVariables: 'UnusedVariables'
    }
};
