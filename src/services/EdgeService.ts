export default class EdgeService {
    static initialize() {
        if ('elementsFromPoint' in document) {
            return;
        }
        document.elementsFromPoint = document.msElementsFromPoint;
    }
}
