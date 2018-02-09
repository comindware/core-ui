
export default function(context, separator, options) {
    let ret = '';

    for (let i = 0, j = context.length; i < j; i++) {
        ret = ret + (i === 0 ? '' : separator) + options.fn(context[i]);
    }

    return ret;
}
