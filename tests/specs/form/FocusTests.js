import 'jasmine-jquery';

const show = view => window.app
.getView()
.getRegion('contentRegion')
.show(view);

const getElement = selector => Backbone.$(selector);

const focusTests = {
    'focusElement should get focus and trigger focus when focus() is called': (options = {}) => done => {
        const view = options.initialize();
        view.on('focus', () => {
            const focusElement = options.focusElement ? getElement(options.focusElement) : view.$el;
            expect(focusElement).toBeFocused();
            expect(view.hasFocus).toEqual(true, 'Must has focus.');
            expect(view.$el).toHaveClass('editor_focused');
            done();
        });

        show(view);
        view.focus();
    },
    'focusElement should lose focus and trigger blur when blur() is called': (options = {}) => done => {
        const view = options.initialize();
        view.on('blur', () => {
            const focusElement = options.focusElement ? getElement(options.focusElement) : view.$el;
            expect(focusElement).not.toBeFocused();
            expect(view.hasFocus).toEqual(false, 'Must has no focus.');
            expect(view.$el).not.toHaveClass('editor_focused');
            done();
        });

        show(view);
        view.focus();
        view.blur();
    }
}

export default {
    runFocusTests(options) { 
        Object.entries(focusTests).forEach(entry => {
            const description = entry[0];
            const getTest = entry[1];
            it(description, getTest(options));
        });
    },
    focusTests
};
