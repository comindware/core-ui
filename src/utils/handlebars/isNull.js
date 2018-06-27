export default function(a, options) {
    if (_.isNull(a)) {
        return options.fn(this);
    }
    return options.inverse(this);
}
