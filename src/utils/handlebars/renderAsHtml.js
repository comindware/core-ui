export default function(text) {
    if (!text) {
        return '';
    }
    const lines = text.split(/[\r\n]+/g);
    const result = [];
    _.each(lines, line => {
        result.push(Handlebars.Utils.escapeExpression(line));
    });
    return result.join('<br>');
}
