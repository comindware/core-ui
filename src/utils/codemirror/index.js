import { codemirror } from 'lib';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/comment-fold';
import comindwareMode from './comindwareMode';

codemirror.defineMode('comindware', comindwareMode);
codemirror.defineMIME('text/comindware_expression', 'comindware');
codemirror.extendMode('clike', {
    newlineAfterToken(type, content, next) {
        return (/[\[(;,{]/.test(content) && !/[)}\]]/.test(next.string));
    }
});
