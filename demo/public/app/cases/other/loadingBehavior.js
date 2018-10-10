

import CanvasView from 'demoPage/views/CanvasView';

export default function() {
    const View = Marionette.View.extend({
        template: Handlebars.compile('' +
            '<input type="button" class="js-show_loading-btn" value="Show Loading"/>' +
            '<input type="button" class="js-show_loading-promise-btn" style="display:block;" value="Show Loading (Promise)"/>' +
            '<div class="js-loading-region l-loader"></div>' // Add loading region to template
        ),

        regions: {
            loadingRegion: '.js-loading-region'
        },

        ui: {
            showLoadingBtn: '.js-show_loading-btn',
            showLoadingPromiseBtn: '.js-show_loading-promise-btn'
        },

        events: {
            'click @ui.showLoadingBtn': '__onShowLoadingBtnClick',
            'click @ui.showLoadingPromiseBtn': '__onShowLoadingPromiseBtnClick'
        },

        //Add loading behavior to your view
        behaviors: {
            LoadingBehavior: {
                behaviorClass: Core.views.behaviors.LoadingBehavior,
                region: 'loadingRegion',
                text: 'Loading' //optional value, default value is 'CORE.VIEWS.BEHAVIORS.LOADING.DEFAULTLOADINGSMALL'

            }
        },

        className: 'loading-behavior-view',

        //You can show and hide loading region manually
        __onShowLoadingBtnClick() {
            this.__showLoading();
            setTimeout(() => {
                this.__hideLoading();
            }, 3000);
        },

        //Or you can control visibility of loading with Promise
        __onShowLoadingPromiseBtnClick() {
            this.loading.setLoading(new Promise((resolve => {
                setTimeout(() => {
                    resolve();
                }, 3000);
            })));
        },

        //Show loading method
        __showLoading() {
            this.loading.setLoading(true);
        },

        //Hide loading method
        __hideLoading() {
            this.loading.setLoading(false);
        }
    });

    return new CanvasView({
        view: new View(),
        canvas: {
            height: '500px'
        }
    });
}
