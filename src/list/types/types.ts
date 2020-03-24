import Backbone from 'backbone';
import { GridItemBehavior } from '../behaviors/GridItemBehavior';

export interface Column {
    key: string,
    id?: string,
    customClass: string,
    editable: boolean,
    isHidden: boolean,
    type: string,
    dataType: string,
    format: string,
    getHidden?:(model: Backbone.Model) => boolean,
    getReadonly?:(model: Backbone.Model) => boolean,
    getRequired?:(model: Backbone.Model) => boolean,
    hasErrors?:(model: Backbone.Model) => boolean,
    [propertyName: string]: any
}

export interface GridItemModel extends Backbone.Model, GridItemBehavior {
    [propertyName: string]: any
}
