/*eslint-disable*/

const defineMode = config => {
    const lexerTokens = {
        NUMBER: /^(?:[+\-]?(?:\d+|\d*\.\d+)(?:[efd][+\-]?\d+)?|[+\-]?\d+(?:\/[+\-]?\d+)?|#b[+\-]?[01]+|#o[+\-]?[0-7]+|#x[+\-]?[\da-f]+)/,
        FARROW: '->',
        BARROW: '<-',
        PLUS: '+',
        MINUS: '-',
        COMMA: ',',
        OR: '||',
        AND: '&&',
        EQUAL2: '==',
        NOT_EQUAL: '!=',
        LESS_EQUAL: '<=',
        GREATER_EQUAL: '=>',
        EQUAL: '=',
        LESS: '<',
        GREATER: '>',
        MULTIPLY: '*',
        DIVIDE: '/',
        NOT: '!',
        OPEN_CURLY_BRACE: '{',
        CLOSE_CURLY_BRACE: '}',
        SEMICOLON: ';',
        OPEN_BRACE: '(',
        CLOSE_BRACE: ')',
        COLON: ':',
        DOUBLEDOLLAR: '$$',
        DOLLAR: '$',
        WS: /\s+/,
        DOT: '.',
        OPEN_SQUARE_BRACE: '[',
        CLOSE_SQUARE_BRACE: ']'
    };

    const keywords = {
        NULL: 'null',
        TRUE: 'true',
        FALSE: 'false'
    };

    const styles = {
        NUMBER: 'number',
        FARROW: 'keyword',
        BARROW: 'keyword',
        PLUS: 'operator',
        MINUS: 'operator',
        COMMA: 'punctuation',
        OR: 'operator',
        AND: 'operator',
        EQUAL2: 'operator',
        EQUAL: 'operator',
        NOT_EQUAL: 'operator',
        LESS_EQUAL: 'operator',
        GREATER_EQUAL: 'operator',
        LESS: 'operator',
        GREATER: 'operator',
        MULTIPLY: 'operator',
        DIVIDE: 'operator',
        NOT: 'operator',
        OPEN_CURLY_BRACE: 'punctuation',
        CLOSE_CURLY_BRACE: 'punctuation',
        SEMICOLON: 'punctuation',
        OPEN_BRACE: 'punctuation',
        CLOSE_BRACE: 'punctuation',
        COLON: 'punctuation',
        DOUBLEDOLLAR: 'keyword',
        DOLLAR: 'keyword',
        NULL: 'keyword',
        TRUE: 'keyword',
        FALSE: 'keyword',
        WS: null,
        DOT: 'punctuation',
        OPEN_SQUARE_BRACE: 'punctuation',
        CLOSE_SQUARE_BRACE: 'punctuation',
    };
    const IDENTIFIER_START = /^[A-Za-z_~\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]+/;
    const IDENTIFIER_BODY = /^[A-Za-z0-9_\.\*~\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0300-\u036F\u0370-\u037D\u037F-\u1FFF\u203F-\u2040\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]+/;

    let type;

    const tokenString = quote => (stream, state) => {
        let escaped = false,
            next,
            end = false;
        while ((next = stream.next()) != null) {
            if (next == quote && !escaped) {
                end = true;
                break;
            }
            escaped = !escaped && next == '\\';
        }
        if (end) {
            state.tokenize = base;
        }
        state.ctx.prev = 'string';
        return 'string';
    };

    const base = (stream, state) => {
        if (stream.sol()) {
            state.ctx.prev = null;
        }
        if (stream.eatSpace()) {
            type = 'ws';
            return null;
        }

        for (const m in lexerTokens) {
            const token = lexerTokens[m];
            const k = stream.match(token);
            if (k) {
                state.ctx.prev = token;
                if (/[({\[]/.test(token)) {
                    state.ctx.indentTo += 4;
                }

                if (/[)}\]]/.test(token)) {
                    state.ctx.indentTo -= 4;
                }
                return styles[m];
            }
        }

        for (const m in keywords) {
            if (stream.match(keywords[m])) {
                state.ctx.prev = 'keyword';
                const style = 'keyword';
                return style;
            }
        }

        const idStart = stream.match(IDENTIFIER_START);
        if (idStart) {
            const idbody = stream.match(IDENTIFIER_BODY);
            let style = 'identifier';
            const id = idStart[0] + (idbody ? idbody[0] : '');
            if (id) {
                const result = state.ontologyObjects.find(obj => obj.text === id);
                if (result) {
                    style = result.type;
                    state.ctx.prev = style;
                }
            }

            state.ctx.prev = 'identifier';
            return style;
        }

        const ch = stream.next();
        if (ch == '\'' || ch == '"') {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }

        return 'error';
    };


    return {
        startState() {
            return { ctx: { prev: null, start: 0, indentTo: 0 }, tokenize: base, firstToken: true, ontologyObjects: this.ontologyObjects };
        },
        token(stream, state) {
            return state.tokenize(stream, state);
        },
        indent(state) {
            return state.ctx.indentTo;
        },
        newlineAfterToken(type, content) {
            return /\w{0,}[(;,{]/.test(content);
        },

        ontologyObjects: config.ontologyObjects
    };
};

export default defineMode;

