/**
 * Developer: Stepan Burguchev
 * Date: 7/23/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

const CollapsibleBehavior = function(model) {
};

_.extend(CollapsibleBehavior.prototype, {
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
        if (!this.collapsed) {
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
});

export default CollapsibleBehavior;
