module.exports = {
    'parser': 'babel-eslint',
    'env': {
        'browser': true,
        'amd': true,
        'es6': true,
        'jquery': true
    },
    'plugins': [
        'prettier'
    ],
    'globals': {
        '__DEV__': true,
        'Backbone': true,
        'Handlebars': true,
        'Localizer': true,
        'Ajax': true,
        'Marionette': true,
        '_': true,
        'describe': true,
        'it': true,
        'beforeEach': true,
        'afterEach': true,
        'moment': true,
        'numeral': true,
        'arguments': true,
        'CKEDITOR': true,
        'Context': true,
        'Core': true,
        'expect': true,
        'jasmine': true
    },
    'extends': [
        'prettier'
    ],
    'rules': {
        'prettier/prettier': 'warn',
        'new-cap': ['off', { 'newIsCap': true, 'capIsNew': false }],
        'quote-props': ['error', 'as-needed'],
        'no-console': ['warn'],
        'arrow-parens': ['warn', 'as-needed'],
        'global-require': 'error',
        'no-param-reassign': ['error', { 'props': false }],
        'linebreak-style': 'off',
        'indent': ['warn', 4, { 'SwitchCase': 1, 'VariableDeclarator': 1 }],
        'operator-linebreak': ['warn', 'before'],
        'multiline-ternary': ['warn', 'always-multiline'],
        'prefer-arrow-callback': 'warn',
        'comma-dangle': 0,
        'func-names': ['warn', 'as-needed'],
        'spaced-comment': 0,
        'prefer-const': 'error',
        'array-bracket-spacing': ['warn', 'never'],
        'array-element-newline' : ['warn', {
            'multiline': true,
            'minItems': 4
        }],
        'arrow-body-style': ['error', 'as-needed'],
        'object-curly-spacing': ['warn', 'always'],
        'object-shorthand': ['warn', 'always'],
        'no-useless-constructor': 'error',
        'no-trailing-spaces': ['warn', { 'skipBlankLines': true }],
        'no-unused-vars': ['warn', { 'vars': 'local' }],
        'max-len': ['warn', 180, 4, {
            'ignoreUrls': true,
            'ignoreComments': false,
            'ignoreStrings': true,
            'ignoreTemplateLiterals': true
        }],
        'no-useless-rename': ['error', {
            'ignoreDestructuring': false,
            'ignoreImport': false,
            'ignoreExport': false
        }],
        'consistent-return': 0, //enable after refactoring
        'no-cond-assign': ['error', 'except-parens'],
        'space-before-function-paren': ['warn', 'never'],
        // enforces getter/setter pairs in objects
        'accessor-pairs': 'off',
        // enforces return statements in callbacks of array's methods
        // http://eslint.org/docs/rules/array-callback-return
        'array-callback-return': 'error',
        // treat var statements as if they were block scoped
        'block-scoped-var': 'error',
        // specify the maximum cyclomatic complexity allowed in a program
        complexity: ['off', 11],
        // enforce that class methods use 'this'
        // http://eslint.org/docs/rules/class-methods-use-this
        'class-methods-use-this': ['off', {
            exceptMethods: [],
        }],
        // specify curly brace conventions for all control statements
        curly: ['error', 'multi-line'],
        // require default case in switch statements
        'default-case': ['error', { commentPattern: '^no default$' }],
        // encourages use of dot notation whenever possible
        'dot-notation': ['error', { allowKeywords: true }],
        // enforces consistent newlines before or after dots
        // http://eslint.org/docs/rules/dot-location
        'dot-location': ['error', 'property'],
        // require the use of === and !==
        // http://eslint.org/docs/rules/eqeqeq
        eqeqeq: ['error', 'always', { null: 'ignore' }],
        // make sure for-in loops have an if statement
        'guard-for-in': 'error',
        // disallow the use of alert, confirm, and prompt
        'no-alert': 'error',
        // disallow use of arguments.caller or arguments.callee
        'no-caller': 'error',
        // disallow lexical declarations in case/default clauses
        // http://eslint.org/docs/rules/no-case-declarations.html
        'no-case-declarations': 'error',
        // disallow division operators explicitly at beginning of regular expression
        // http://eslint.org/docs/rules/no-div-regex
        'no-div-regex': 'off',
        // disallow else after a return in an if
        'no-else-return': 'error',
        // disallow empty functions, except for standalone funcs/arrows
        // http://eslint.org/docs/rules/no-empty-function
        'no-empty-function': ['error', {
            allow: [
                'arrowFunctions',
                'functions',
                'methods',
            ]
        }],
        // disallow empty destructuring patterns
        // http://eslint.org/docs/rules/no-empty-pattern
        'no-empty-pattern': 'error',
        // disallow comparisons to null without a type-checking operator
        'no-eq-null': 'off',
        // disallow use of eval()
        'no-eval': 'error',
        // disallow adding to native types
        'no-extend-native': 'error',
        // disallow unnecessary function binding
        'no-extra-bind': 'error',
        // disallow Unnecessary Labels
        // http://eslint.org/docs/rules/no-extra-label
        'no-extra-label': 'error',
        // disallow fallthrough of case statements
        'no-fallthrough': 'off',
        // disallow reassignments of native objects or read-only globals
        // http://eslint.org/docs/rules/no-global-assign
        'no-global-assign': ['error', { exceptions: [] }],
        // disallow implicit type conversions
        // http://eslint.org/docs/rules/no-implicit-coercion
        'no-implicit-coercion': ['off', {
            boolean: false,
            number: true,
            string: true,
            allow: [],
        }],
        // disallow var and named functions in global scope
        // http://eslint.org/docs/rules/no-implicit-globals
        'no-implicit-globals': 'off',
        // disallow use of eval()-like methods
        'no-implied-eval': 'error',
        // disallow this keywords outside of classes or class-like objects
        'no-invalid-this': 'off',
        // disallow usage of __iterator__ property
        'no-iterator': 'error',
        // disallow use of labels for anything other then loops and switches
        'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
        // disallow unnecessary nested blocks
        'no-lone-blocks': 'error',
        // disallow magic numbers
        // http://eslint.org/docs/rules/no-magic-numbers
        'no-magic-numbers': ['off', {
            ignore: [],
            ignoreArrayIndexes: true,
            enforceConst: true,
            detectObjects: false,
        }],
        // disallow use of multiple spaces
        'no-multi-spaces': 'warn',
        // disallow use of multiline strings
        'no-multi-str': 'error',
        // disallow use of new operator for Function object
        'no-new-func': 'error',
        // disallows creating new instances of String, Number, and Boolean
        'no-new-wrappers': 'error',
        // disallow use of (old style) octal literals
        'no-octal': 'error',
        // disallow use of octal escape sequences in string literals, such as
        // var foo = 'Copyright \251';
        'no-octal-escape': 'error',
        // disallow usage of __proto__ property
        'no-proto': 'error',
        // disallow declaring the same variable more then once
        'no-redeclare': 'error',
        // disallow certain object properties
        // http://eslint.org/docs/rules/no-restricted-properties
        'no-restricted-properties': ['error', {
            object: 'arguments',
            property: 'callee',
            message: 'arguments.callee is deprecated',
        }, {
            property: '__defineGetter__',
            message: 'Please use Object.defineProperty instead.',
        }, {
            property: '__defineSetter__',
            message: 'Please use Object.defineProperty instead.',
        }, {
            object: 'Math',
            property: 'pow',
            message: 'Use the exponentiation operator (**) instead.',
        }],
        // disallow use of `javascript:` urls.
        'no-script-url': 'error',
        // disallow self assignment
        // http://eslint.org/docs/rules/no-self-assign
        'no-self-assign': 'error',
        // disallow comparisons where both sides are exactly the same
        'no-self-compare': 'error',
        // restrict what can be thrown as an exception
        'no-throw-literal': 'error',
        // disallow unmodified conditions of loops
        // http://eslint.org/docs/rules/no-unmodified-loop-condition
        'no-unmodified-loop-condition': 'off',
        // disallow usage of expressions in statement position
        'no-unused-expressions': 'off',
        // disallow unused labels
        // http://eslint.org/docs/rules/no-unused-labels
        'no-unused-labels': 'error',
        // disallow unnecessary .call() and .apply()
        'no-useless-call': 'off',
        // disallow useless string concatenation
        // http://eslint.org/docs/rules/no-useless-concat
        'no-useless-concat': 'error',
        // disallow unnecessary string escaping
        // http://eslint.org/docs/rules/no-useless-escape
        'no-useless-escape': 'off',
        // disallow redundant return; keywords
        // http://eslint.org/docs/rules/no-useless-return
        'no-useless-return': 'error',
        // disallow use of void operator
        // http://eslint.org/docs/rules/no-void
        'no-void': 'error',
        // disallow use of the with statement
        'no-with': 'error',
        // require `await` in `async function`
        // http://eslint.org/docs/rules/require-await
        'require-await': 'off',
        // require immediate function invocation to be wrapped in parentheses
        // http://eslint.org/docs/rules/wrap-iife.html
        'wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],
        // require or disallow Yoda conditions
        yoda: 'error',
        // disallow use of constant expressions in conditions
        'no-constant-condition': 'off',
        // disallow control characters in regular expressions
        'no-control-regex': 'error',
        // disallow use of debugger
        'no-debugger': 'warn',
        // disallow duplicate arguments in functions
        'no-dupe-args': 'error',
        // disallow duplicate keys when creating object literals
        'no-dupe-keys': 'error',
        // disallow a duplicate case label.
        'no-duplicate-case': 'error',
        // disallow empty statements
        'no-empty': 'error',
        // disallow the use of empty character classes in regular expressions
        'no-empty-character-class': 'error',
        // disallow assigning to the exception in a catch block
        'no-ex-assign': 'error',
        // disallow double-negation boolean casts in a boolean context
        // http://eslint.org/docs/rules/no-extra-boolean-cast
        'no-extra-boolean-cast': 'error',
        // disallow unnecessary parentheses
        // http://eslint.org/docs/rules/no-extra-parens
        'no-extra-parens': ['off', 'all', {
            conditionalAssign: true,
            nestedBinaryExpressions: false,
            returnAssign: false,
        }],
        // disallow unnecessary semicolons
        'no-extra-semi': 'error',
        // disallow overwriting functions written as function declarations
        'no-func-assign': 'error',
        // disallow invalid regular expression strings in the RegExp constructor
        'no-invalid-regexp': 'error',
        // disallow irregular whitespace outside of strings and comments
        'no-irregular-whitespace': 'warn',
        // disallow the use of object properties of the global object (Math and JSON) as functions
        'no-obj-calls': 'error',
        // disallow use of Object.prototypes builtins directly
        // http://eslint.org/docs/rules/no-prototype-builtins
        'no-prototype-builtins': 'error',
        // disallow multiple spaces in a regular expression literal
        'no-regex-spaces': 'error',
        // disallow sparse arrays4
        'no-sparse-arrays': 'error',
        // Disallow template literal placeholder syntax in regular strings
        // http://eslint.org/docs/rules/no-template-curly-in-string
        'no-template-curly-in-string': 'error',
        // disallow unreachable statements after a return, throw, continue, or break statement
        'no-unreachable': 'error',
        // disallow return/throw/break/continue inside finally blocks
        // http://eslint.org/docs/rules/no-unsafe-finally
        'no-unsafe-finally': 'error',
        // disallow negating the left operand of relational operators
        // http://eslint.org/docs/rules/no-unsafe-negation
        'no-unsafe-negation': 'error',
        // disallow negation of the left operand of an in expression
        // deprecated in favor of no-unsafe-negation
        'no-negated-in-lhs': 'off',
        // ensure JSDoc comments are valid
        // http://eslint.org/docs/rules/valid-jsdoc
        'valid-jsdoc': 'off',
        // ensure that the results of typeof are compared against a valid string
        // http://eslint.org/docs/rules/valid-typeof
        'valid-typeof': ['error', { requireStringLiterals: true }],
        // ensure named imports coupled with named exports
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/named.md#when-not-to-use-it
        'import/named': 'off',
        // ensure default import coupled with default export
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/default.md#when-not-to-use-it
        'import/default': 'off',
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/namespace.md
        'import/namespace': 'off',
        // disallow use of jsdoc-marked-deprecated imports
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-deprecated.md
        'import/no-deprecated': 'off',
        // disallow require()
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-commonjs.md
        'import/no-commonjs': 'off',
        // disallow non-import statements appearing before import statements
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/imports-first.md
        // deprecated: use `import/first`
        'import/imports-first': 'off',
        // Restrict which files can be imported in a given folder
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-restricted-paths.md
        'import/no-restricted-paths': 'off',
        // Forbid modules to have too many dependencies
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/max-dependencies.md
        'import/max-dependencies': ['off', { max: 10 }],
        // prevent importing the submodules of other modules
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-internal-modules.md
        'import/no-internal-modules': ['off', {
            allow: [],
        }],
        // Warn if a module could be mistakenly parsed as a script by a consumer
        // leveraging Unambiguous JavaScript Grammar
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/unambiguous.md
        // this should not be enabled until this proposal has at least been *presented* to TC39.
        // At the moment, it's not a thing.
        'import/unambiguous': 'off',
        // Prevent unassigned imports
        // https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unassigned-import.md
        // importing for side effects is perfectly acceptable, if you need side effects.
        'import/no-unassigned-import': 'off',
        // enforce or disallow variable initializations at definition
        'init-declarations': 'off',
        // disallow the catch clause parameter name being the same as a variable in the outer scope
        'no-catch-shadow': 'off',
        // disallow labels that share a name with a variable
        // http://eslint.org/docs/rules/no-label-var
        'no-label-var': 'error',
        // disallow declaration of variables already declared in the outer scope
        'no-shadow': 'error',
        // disallow shadowing of names such as arguments
        'no-shadow-restricted-names': 'error',
        // disallow use of undeclared variables unless mentioned in a /*global */ block
        'no-undef': 'error',
        // disallow use of undefined when initializing variables
        'no-undef-init': 'error',
        // disallow use of variables before they are defined
        'no-use-before-define': ['error', { functions: true, classes: true, variables: true }],
        // require space before/after arrow function's arrow
        // http://eslint.org/docs/rules/arrow-spacing
        'arrow-spacing': ['warn', { before: true, after: true }],
        // verify super() callings in constructors
        'constructor-super': 'error',
        // enforce the spacing around the * in generator functions
        // http://eslint.org/docs/rules/generator-star-spacing
        'generator-star-spacing': ['error', { before: false, after: true }],
        // disallow arrow functions where they could be confused with comparisons
        // http://eslint.org/docs/rules/no-confusing-arrow
        'no-confusing-arrow': ['error', {
            allowParens: true,
        }],
        // disallow modifying variables that are declared using const
        'no-const-assign': 'error',
        // disallow duplicate class members
        // http://eslint.org/docs/rules/no-dupe-class-members
        'no-dupe-class-members': 'error',
        // disallow importing from the same path more than once
        // http://eslint.org/docs/rules/no-duplicate-imports
        // replaced by https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md
        'no-duplicate-imports': 'off',
        // disallow symbol constructor
        // http://eslint.org/docs/rules/no-new-symbol
        'no-new-symbol': 'error',
        // disallow specific imports
        // http://eslint.org/docs/rules/no-restricted-imports
        'no-restricted-imports': 'off',
        // disallow to use this/super before super() calling in constructors.
        // http://eslint.org/docs/rules/no-this-before-super
        'no-this-before-super': 'error',
        // disallow useless computed property keys
        // http://eslint.org/docs/rules/no-useless-computed-key
        'no-useless-computed-key': 'error',
        // require let or const instead of var
        'no-var': 'error',
        // disallow parseInt() in favor of binary, octal, and hexadecimal literals
        // http://eslint.org/docs/rules/prefer-numeric-literals
        'prefer-numeric-literals': 'error',
        // suggest using Reflect methods where applicable
        // http://eslint.org/docs/rules/prefer-reflect
        'prefer-reflect': 'off',
        // suggest using template literals instead of string concatenation
        // http://eslint.org/docs/rules/prefer-template
        'prefer-template': 'error',
        // disallow generator functions that do not have yield
        // http://eslint.org/docs/rules/require-yield
        'require-yield': 'error',
        // enforce spacing between object rest-spread
        // http://eslint.org/docs/rules/rest-spread-spacing
        'rest-spread-spacing': ['error', 'never'],
        // import sorting
        // http://eslint.org/docs/rules/sort-imports
        'sort-imports': ['off', {
            ignoreCase: false,
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        }],
        // require a Symbol description
        // http://eslint.org/docs/rules/symbol-description
        'symbol-description': 'error',
        // enforce usage of spacing in template strings
        // http://eslint.org/docs/rules/template-curly-spacing
        'template-curly-spacing': 'error',
        // enforce spacing around the * in yield* expressions
        // http://eslint.org/docs/rules/yield-star-spacing
        'yield-star-spacing': ['error', 'after'],
        // enforce spacing inside single-line blocks
        // http://eslint.org/docs/rules/block-spacing
        'block-spacing': ['error', 'always'],
        // enforce one true brace style
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        // require camel case names
        camelcase: ['off', { properties: 'always' }],
        // enforce or disallow capitalization of the first letter of a comment
        // http://eslint.org/docs/rules/capitalized-comments
        'capitalized-comments': ['off', 'never', {
            line: {
                ignorePattern: '.*',
                ignoreInlineComments: true,
                ignoreConsecutiveComments: true,
            },
            block: {
                ignorePattern: '.*',
                ignoreInlineComments: true,
                ignoreConsecutiveComments: true,
            },
        }],
        // enforce spacing before and after comma
        'comma-spacing': ['error', { before: false, after: true }],
        // enforce one true comma style
        'comma-style': ['error', 'last'],
        // disallow padding inside computed properties
        'computed-property-spacing': ['error', 'never'],
        // enforces consistent naming when capturing the current execution context
        'consistent-this': 'off',
        // enforce newline at the end of file, with no multiple empty lines
        'eol-last': ['error', 'always'],
        // enforce spacing between functions and their invocations
        // http://eslint.org/docs/rules/func-call-spacing
        'func-call-spacing': ['error', 'never'],
        // requires function names to match the name of the variable or property to which they are
        // assigned
        // http://eslint.org/docs/rules/func-name-matching
        'func-name-matching': ['off', 'always', {
            includeCommonJSModuleExports: false
        }],
        // Blacklist certain identifiers to prevent them being used
        // http://eslint.org/docs/rules/id-blacklist
        'id-blacklist': 'off',
        // this option enforces minimum and maximum identifier lengths
        // (variable names, property names etc.)
        'id-length': 'off',
        // require identifiers to match the provided regular expression
        'id-match': 'off',
        // specify whether double or single quotes should be used in JSX attributes
        // http://eslint.org/docs/rules/jsx-quotes
        'jsx-quotes': ['off', 'prefer-double'],
        // enforces spacing between keys and values in object literal properties
        'key-spacing': ['error', { beforeColon: false, afterColon: true }],
        // require a space before & after certain keywords
        'keyword-spacing': ['warn', {
            before: true,
            after: true,
            overrides: {
                return: { after: true },
                throw: { after: true },
                case: { after: true }
            }
        }],
        // enforces empty lines around comments
        'lines-around-comment': 'off',
        // require or disallow newlines around directives
        // http://eslint.org/docs/rules/lines-around-directive
        'lines-around-directive': ['error', {
            before: 'always',
            after: 'always',
        }],
        // specify the maximum depth that blocks can be nested
        'max-depth': ['off', 4],
        // specify the max number of lines in a file
        // http://eslint.org/docs/rules/max-lines
        'max-lines': ['off', {
            max: 300,
            skipBlankLines: true,
            skipComments: true
        }],
        // specify the maximum depth callbacks can be nested
        'max-nested-callbacks': 'off',
        // limits the number of parameters that can be used in the function declaration.
        'max-params': ['off', 3],
        // specify the maximum number of statement allowed in a function
        'max-statements': ['off', 10],
        // restrict the number of statements per line
        // http://eslint.org/docs/rules/max-statements-per-line
        'max-statements-per-line': ['off', { max: 1 }],
        // disallow the omission of parentheses when invoking a constructor with no arguments
        // http://eslint.org/docs/rules/new-parens
        'new-parens': 'error',
        // allow/disallow an empty newline after var statement
        'newline-after-var': 'off',
        // http://eslint.org/docs/rules/newline-before-return
        'newline-before-return': 'off',
        // enforces new line after each method call in the chain to make it
        // more readable and easy to maintain
        // http://eslint.org/docs/rules/newline-per-chained-call
        'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
        // disallow use of the Array constructor
        'no-array-constructor': 'error',
        // disallow use of bitwise operators
        // http://eslint.org/docs/rules/no-bitwise
        'no-bitwise': 'off',
        // disallow comments inline after code
        'no-inline-comments': 'off',
        // disallow if as the only statement in an else block
        // http://eslint.org/docs/rules/no-lonely-if
        'no-lonely-if': 'error',
        // disallow un-paren'd mixes of different operators
        // http://eslint.org/docs/rules/no-mixed-operators
        'no-mixed-operators': ['error', {
            groups: [
                ['&', '|', '^', '~', '<<', '>>', '>>>'],
                ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                ['&&', '||'],
                ['in', 'instanceof']
            ]
        }],
        // disallow mixed spaces and tabs for indentation
        'no-mixed-spaces-and-tabs': 'warn',
        // disallow use of chained assignment expressions
        // http://eslint.org/docs/rules/no-multi-assign
        'no-multi-assign': 'off',
        // disallow multiple empty lines and only one newline at the end
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
        // disallow negated conditions
        // http://eslint.org/docs/rules/no-negated-condition
        'no-negated-condition': 'off',
        // disallow nested ternary expressions
        'no-nested-ternary': 'off',
        // disallow use of the Object constructor
        'no-new-object': 'error',
        // disallow certain syntax forms
        // http://eslint.org/docs/rules/no-restricted-syntax
        'no-restricted-syntax': [
            'error',
            {
                selector: 'ForInStatement',
                message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
            },
            {
                selector: 'LabeledStatement',
                message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
            },
            {
                selector: 'WithStatement',
                message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
            },
        ],
        // disallow space between function identifier and application
        'no-spaced-func': 'warn',
        // disallow tab characters entirely
        'no-tabs': 'error',
        // disallow the use of ternary operators
        'no-ternary': 'off',
        // disallow the use of Boolean literals in conditional expressions
        // also, prefer `a || b` over `a ? a : b`
        // http://eslint.org/docs/rules/no-unneeded-ternary
        'no-unneeded-ternary': ['error', { defaultAssignment: false }],
        // disallow whitespace before properties
        // http://eslint.org/docs/rules/no-whitespace-before-property
        'no-whitespace-before-property': 'warn',
        // enforce the location of single-line statements
        // http://eslint.org/docs/rules/nonblock-statement-body-position
        'nonblock-statement-body-position': 'off',
        // enforce 'same line' or 'multiple line' on object properties.
        // http://eslint.org/docs/rules/object-property-newline
        'object-property-newline': ['error', {
            allowMultiplePropertiesPerLine: true,
        }],
        // allow just one var statement per function
        'one-var': ['error', { var: 'never', let: 'never', const: 'never' } ],
        // require a newline around variable declaration
        // http://eslint.org/docs/rules/one-var-declaration-per-line
        'one-var-declaration-per-line': ['error', 'always'],
        // require assignment operator shorthand where possible or prohibit it entirely
        // http://eslint.org/docs/rules/operator-assignment
        'operator-assignment': ['error', 'always'],
        // enforce padding within blocks
        'padded-blocks': ['error', 'never'],
        // specify whether double or single quotes should be used
        quotes: ['error', 'single', { avoidEscape: true }],
        // do not require jsdoc
        // http://eslint.org/docs/rules/require-jsdoc
        'require-jsdoc': 'off',
        // require or disallow use of semicolons instead of ASI
        semi: ['error', 'always'],
        // enforce spacing before and after semicolons
        'semi-spacing': ['error', { before: false, after: true }],
        // requires object keys to be sorted
        'sort-keys': ['off', 'asc', { caseSensitive: false, natural: true }],
        // sort variables within the same declaration block
        'sort-vars': 'off',
        // require or disallow space before blocks
        'space-before-blocks': 'warn',
        // require or disallow spaces inside parentheses
        'space-in-parens': ['warn', 'never'],
        // require spaces around operators
        'space-infix-ops': 'warn',
        // Require or disallow spaces before/after unary operators
        // http://eslint.org/docs/rules/space-unary-ops
        'space-unary-ops': ['warn', {
            words: true,
            nonwords: false,
            overrides: {
            },
        }],
        // require or disallow the Unicode Byte Order Mark
        // http://eslint.org/docs/rules/unicode-bom
        'unicode-bom': ['error', 'never'],
        // require regex literals to be wrapped in parentheses
        'wrap-regex': 'off'
    }
};
