
export interface GridItemBehavior {
    selected?: boolean,
    checked?: boolean,
    collapsed?: boolean,
    highlighted?: boolean,
    highlightedFragment?: string,
    /**
    * Select this model, and tell ourcollection that we're selected
    */
    select(options?: any): void,
    /**
    * Deselect this model, and tell ourcollection that we're deselected
    */
    deselect(options?: any): void,
    /**
    * Change selected to the opposite of what is currently is
    */
    toggleSelected(isSelected?: boolean, options?: any): void,
    pointOff(options?: any): void,
    pointTo(): void,
    pointTo(): void,
    check(): void,
    uncheck(): void,
    checkSome(): void,
    toggleChecked(isShiftKeyPressed: boolean): void,
    highlight(text: string): void,
    unhighlight(): void,
    collapse(internal: boolean): void,
    expand(internal: boolean): void,
    toggleCollapsed(): void
}

export default function() : GridItemBehavior {
    return {
        select(options) {
            if (this.selected) {
                return;
            }

            this.selected = true;

            const collection = this.selectableCollection || this.collection;
            if (collection && collection.select) {
                collection.select(this, undefined, undefined, undefined, options);
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

            const collection = this.selectableCollection || this.collection;
            if (collection && collection.deselect) {
                collection.deselect(this, undefined, undefined, undefined, options);
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

        toggleSelected(isSelect = !this.selected, options) {
            if (isSelect) {
                this.select(options);
            } else {
                this.deselect(options);
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

        toggleChecked(isShiftKeyPressed) {
            if (isShiftKeyPressed) {
                this.collection.checkSmart(this, isShiftKeyPressed);
            } else if (this.checked) {
                this.uncheck(isShiftKeyPressed);
            } else {
                this.check(isShiftKeyPressed);
            }
        },

        highlight(text) {
            if (this.highlightedFragment === text) {
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

        collapse(internal) {
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

        expand(internal) {
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
