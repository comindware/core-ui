/**
 * Caution: this is a modified version of Backbone.Trackit. You should not replace it with git version as it is buggy and not supported by its creator anymore
 */
(function() {
    // Unsaved Record Keeping
    // ----------------------

    // Collection of all models in an app that have unsaved changes.
    let unsavedModels = [];

    // If the given model has unsaved changes then add it to
    // the `unsavedModels` collection, otherwise remove it.
    const updateUnsavedModels = function(model) {
        if (!_.isEmpty(model._unsavedChanges)) {
            if (!_.findWhere(unsavedModels, { cid: model.cid })) unsavedModels.push(model);
        } else {
            unsavedModels = _.filter(unsavedModels, m => model.cid != m.cid);
        }
    };

    // Backbone.Model API
    // ------------------

    _.extend(Backbone.Model.prototype, {
        unsaved: {},
        _trackingChanges: false,
        _originalAttrs: {},
        _unsavedChanges: {},

        // Opt in to tracking attribute changes
        // between saves.
        startTracking() {
            this._unsavedConfig = _.extend(
                {},
                {
                    prompt: 'You have unsaved changes!',
                    unloadRouterPrompt: false,
                    unloadWindowPrompt: false
                },
                this.unsaved || {}
            );
            this._trackingChanges = true;
            this._resetTracking();
            this._triggerUnsavedChanges();
            return this;
        },

        // Resets the default tracking values
        // and stops tracking attribute changes.
        stopTracking() {
            this._trackingChanges = false;
            this._originalAttrs = {};
            this._unsavedChanges = {};
            this._triggerUnsavedChanges();
            return this;
        },

        // Gets rid of accrued changes and
        // resets state.
        restartTracking() {
            this._resetTracking();
            this._triggerUnsavedChanges();
            return this;
        },

        // Restores this model's attributes to
        // their original values since tracking
        // started, the last save, or last restart.
        resetAttributes() {
            if (!this._trackingChanges) return;
            this.attributes = this._originalAttrs;
            this._resetTracking();
            this._triggerUnsavedChanges();
            return this;
        },

        // Symmetric to Backbone's `model.changedAttributes()`,
        // except that this returns a hash of the model's attributes that
        // have changed since the last save, or `false` if there are none.
        // Like `changedAttributes`, an external attributes hash can be
        // passed in, returning the attributes in that hash which differ
        // from the model.
        unsavedAttributes(attrs) {
            if (!attrs) return _.isEmpty(this._unsavedChanges) ? false : Object.assign({}, this._unsavedChanges);
            let val,
                changed = false,
                old = this._unsavedChanges;
            for (const attr in attrs) {
                if (_.isEqual(old[attr], (val = attrs[attr]))) continue;
                (changed || (changed = {}))[attr] = val;
            }
            return changed;
        },

        _resetTracking() {
            this._originalAttrs = Object.assign({}, this.attributes);
            this._unsavedChanges = {};
        },

        // Trigger an `unsavedChanges` event on this model,
        // supplying the result of whether there are unsaved
        // changes and a changed attributes hash.
        _triggerUnsavedChanges() {
            this.trigger('unsavedChanges', !_.isEmpty(this._unsavedChanges), Object.assign({}, this._unsavedChanges));
            if (this.unsaved) updateUnsavedModels(this);
        }
    });

    // Wrap `model.set()` and update the internal
    // unsaved changes record keeping.
    Backbone.Model.prototype.set = _.wrap(Backbone.Model.prototype.set, function(oldSet, key, val, options) {
        let attrs, ret;
        if (key == null) return this;
        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }
        options || (options = {});

        // Delegate to Backbone's set.
        ret = oldSet.call(this, attrs, Object.assign({}, options));

        if (this._trackingChanges && !options.silent && !options.trackit_silent) {
            _.each(
                attrs,
                _.bind(function(val, key) {
                    if (_.isEqual(this._originalAttrs[key], val)) {
                        delete this._unsavedChanges[key];
                    } else {
                        this._unsavedChanges[key] = val;
                    }
                }, this)
            );
            this._triggerUnsavedChanges();
        }
        return ret;
    });

    // Intercept `model.save()` and reset tracking/unsaved
    // changes if it was successful.
    Backbone.sync = _.wrap(Backbone.sync, function(oldSync, method, model, options) {
        options || (options = {});

        if (method == 'update' || method == 'patch') {
            options.success = _.wrap(
                options.success,
                _.bind(function(oldSuccess, data, textStatus, jqXHR) {
                    let ret;
                    if (oldSuccess) ret = oldSuccess.call(this, data, textStatus, jqXHR);
                    if (model._trackingChanges) {
                        model._resetTracking();
                        model._triggerUnsavedChanges();
                    }
                    return ret;
                }, this)
            );
        }
        return oldSync(method, model, options);
    });
})();
