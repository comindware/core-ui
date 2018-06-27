const HighlightableBehavior = function() {};

_.extend(HighlightableBehavior.prototype, {
    highlight(text) {
        if (this.highlighted) {
            return;
        }

        this.highlighted = true;
        this.highlightedFragment = text;
        this.set('highlightedFragment', text);
        this.trigger('highlighted', this, {
            text
        });
    },

    unhighlight() {
        if (!this.highlighted) {
            return;
        }

        this.highlighted = false;
        this.highlightedFragment = undefined;
        this.trigger('unhighlighted', this);
    }
});

export default HighlightableBehavior;
