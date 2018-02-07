
import { htmlHelpers } from '../index';

export default function(text, fragment) {
    if (!text) {
        return '';
    }
    if (!fragment) {
        return new Handlebars.SafeString(Handlebars.escapeExpression(text));
    }
    return new Handlebars.SafeString(htmlHelpers.highlightText(text, fragment, true));
}
