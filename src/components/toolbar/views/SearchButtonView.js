import SearchBarView from '../../../views/SearchBarView';

export default SearchBarView.extend({
    attributes() {
        return {
            title: this.model.get('description') || ''
        };
    }
});
