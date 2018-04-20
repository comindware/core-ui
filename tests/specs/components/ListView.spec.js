import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    const data = _.times(10000, i => ({
        id: i + 1,
        title: `My Task ${i + 1}`
    }));

    const ListItemView = Marionette.View.extend({
        template: Handlebars.compile('<div class="dd-list__i">{{title}}</div>'),

        behaviors: {
            ListItemViewBehavior: {
                behaviorClass: core.list.views.behaviors.ListItemViewBehavior
            }
        }
    });

    describe('ListView', () => {
        it('should initialize', () => {
            const listView = core.list.factory.createDefaultList({
                collection: data,
                listViewOptions: {
                    childView: ListItemView,
                    childHeight: 25
                }
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(listView);

            expect(true).toBe(true);
        });

        it('should update visible models on scroll', done => {
            // document.body.style.height = '1000px';
            // document.body.appendChild(window.app.getView().getRegion('contentRegion').$el[0]);

            window.app
                .getView()
                .getRegion('contentRegion')
                .$el.css({
                    height: 1000,
                    width: 1000,
                    overflow: 'hidden',
                    position: 'relative'
                });

            const listView = core.list.factory.createDefaultList({
                collection: data,
                listViewOptions: {
                    childView: ListItemView,
                    childHeight: 25
                }
            });

            window.innerHeight = 1920;

            listView.$el.on('scroll', () =>
                setTimeout(() => {
                    // waiting style updates
                    expect(listView.collection.visibleLength).toBe(60);
                    expect(listView.state.position).toBe(30, 'Scroll - half of the buffer');
                    expect(listView.children.findByIndex(0).el.style.top).toBe('750px');
                    done();
                }, 0)
            );

            listView.on('attach', () => {
                expect(listView.collection.visibleLength).toBe(60, 'Visible models: items on page + buffer');
                expect(listView.el.clientHeight).toBe(1000);
                listView.el.scrollTop = 1000;
            });
            window.app
                .getView()
                .getRegion('contentRegion')
                .show(listView);
        });
    });
});
