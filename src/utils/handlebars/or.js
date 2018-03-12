export default function(v1, v2, v3, options) {
    if (!!v1 || !!v2 || !!v3) {
        return options.fn(this);
    }
    options.inverse(this);
}
