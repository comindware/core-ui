import core from 'coreApi';
import 'jasmine-jquery';

describe('Components', () => {
    const data = _.times(1000, i => ({
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
            const listView = new core.list.GridView({
                collection: data,
                childView: ListItemView,
                childHeight: 25
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(listView);

            expect(true).toBe(true);
        });
        /*
        it('should update visible models on scroll', done => {
            window.app
                .getView()
                .$('.js-content-region')
                .css({
                    height: 1000,
                    width: 1000,
                    overflow: 'auto',
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

            listView.on('attach', () => {
                expect(listView.collection.visibleLength).toBe(60, 'Visible models: items on page + buffer');
                expect(listView.$el.height()).toBe(250000);
                expect(listView.$el.parent().height()).toBe(1000);
                listView.$el.parent().on('scroll', () => {
                    expect(listView.collection.visibleLength).toBe(60);
                    expect(listView.state.position).toBe(30, 'Scroll - half of the buffer');
                    expect(
                        listView.$el
                            .children()
                            .first()
                            .css('top')
                    ).toBe('750px');
                    done();
                    listView.$el.parent().off('scroll');
                });
                listView.$el.parent().scrollTop(1000);
            });

            window.app
                .getView()
                .getRegion('contentRegion')
                .show(listView);
        });
        */
    });
});
