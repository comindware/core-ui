
export default function(a, b, options) {
    if (a !== b) {
        return options.inverse(this);
    }
    return options.fn(this);
}
