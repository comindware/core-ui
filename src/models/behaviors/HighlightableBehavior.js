/**
 * Developer: Stepan Burguchev
 * Date: 7/23/2014
 * Copyright: 2009-2016 Comindware®
 *       All Rights Reserved
 * Published under the MIT license
 */

'use strict';

import 'lib';

const HighlightableBehavior = function() {
};

_.extend(HighlightableBehavior.prototype, {
    highlight(text) {
        if (this.highlighted) {
            return;
        }

        this.highlighted = true;
        this.highlightedFragment = text;
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
