//@flow
export default function () {
    // Select this model, and tell our
    // collection that we're selected
    return {
        select(options) {
            if (this.selected) {
                return;
            }

            this.selected = true;

            if (this.collection) {
                this.collection.select(this, undefined, undefined, undefined, options);
            }

            this.trigger('selected', this, options);
        },

        // Deselect this model, and tell our
        // collection that we're deselected
        deselect(options) {
            if (!this.selected) {
                return;
            }

            this.selected = false;

            if (this.collection && this.collection.deselect) {
                this.collection.deselect(this, undefined, undefined, undefined, options);
            }

            this.trigger('deselected', this, options);
        },

        pointTo() {
            this.pointed = true;
            this.trigger('pointed', this);
        },

        pointOff() {
            this.pointed = false;
            this.trigger('unpointed', this);
        },

        // Change selected to the opposite of what
        // it currently is
        toggleSelected(options) {
            if (this.selected) {
                this.deselect(options);
            } else {
                this.select(options);
            }
        },

        check() {
            if (this.checked) {
                return;
            }

            this.checked = true;
            this.trigger('checked', this);

            if (this.collection) {
                this.collection.check(this);
            }
        },

        uncheck() {
            if (this.checked === false) {
                return;
            }

            this.checked = false;
            this.trigger('unchecked', this);

            if (this.collection) {
                this.collection.uncheck(this);
            }
        },

        checkSome() {
            if (this.checked === null) {
                return;
            }

            this.checked = null;
            this.trigger('checked:some', this);
            if (this.collection) {
                this.collection.checkSome(this);
            }
        },

        toggleChecked() {
            if (this.checked) {
                this.uncheck();
            } else {
                this.check();
            }
        },

        highlight(text: String) {
            if (this.highlighted) {
                return;
            }

            this.highlighted = true;
            this.highlightedFragment = text;
            this.set('highlightedFragment', text);
            this.trigger('highlighted', {
                text
            });
        },

        unhighlight() {
            if (!this.highlighted) {
                return;
            }

            this.highlighted = false;
            this.highlightedFragment = undefined;
            this.trigger('unhighlighted');
        },

        collapse(internal: Boolean) {
            if (this.collapsed) {
                return;
            }

            this.collapsed = true;
            this.trigger('collapsed', this);
            this.trigger('toggle:collapse', this);

            if (!internal && this.collection && this.collection.collapse) {
                this.collection.collapse(this);
            }
        },

        expand(internal: Boolean) {
            if (this.collapsed === false) {
                return;
            }

            this.collapsed = false;
            this.trigger('expanded', this);
            this.trigger('toggle:collapse', this);
            if (!internal && this.collection && this.collection.expand) {
                this.collection.expand(this);
            }
        },

        toggleCollapsed() {
            if (this.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    };
}
