import list from 'list';
import EditableCellView from '../views/EditableCellView';

export default {
    getCellViewForColumn(column) {
        if (column.readonly) {
            return list.cellFactory.getCellViewByDataType(column.type);
        }
        return EditableCellView.extend({
            schema: column
        });
    }
};
