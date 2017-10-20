
import core from 'comindware/core';
import CanvasView from 'demoPage/views/CanvasView';
import DemoProfilePanelView from 'demoPage/views/DemoProfilePanelView';

export default function() {
    const AnchoredButtonView = Marionette.ItemView.extend({
        template: Handlebars.compile('<span>My </span><a href="javascript:void(0);" class="js-anchor">custom</a><span> anchor</span>'),
        behaviors: {
            CustomAnchorBehavior: {
                behaviorClass: core.dropdown.views.behaviors.CustomAnchorBehavior,
                anchor: '.js-anchor'
            }
        },
        tagName: 'div'
    });

    const popout = core.dropdown.factory.createPopout({
        buttonView: AnchoredButtonView,
        panelView: DemoProfilePanelView,
        popoutFlow: 'right',
        customAnchor: true
    });

    return new CanvasView({
        view: popout,
        canvas: {
            height: '30px'
        },
        region: {
            float: 'left'
        }
    });
}
