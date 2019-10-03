import core from 'coreApi';

const comparators = core.utils.comparators;

describe('Data comparators', () => {
    it('should apply string Comparator 2 Asc', () => {
        expect(comparators.stringComparator2Asc('a', 'b')).toEqual(-1);
        expect(comparators.stringComparator2Asc('b', 'a')).toEqual(1);
        expect(comparators.stringComparator2Asc('a', null)).toEqual(-1);
        expect(comparators.stringComparator2Asc(null, 'b')).toEqual(1);
        expect(comparators.stringComparator2Asc(null, null)).toEqual(0);
        expect(comparators.stringComparator2Asc('a', 'a')).toEqual(0);
    });

    it('should apply string Comparator 2 Desc', () => {
        expect(comparators.stringComparator2Desc('a', 'b')).toEqual(1);
        expect(comparators.stringComparator2Desc('b', 'a')).toEqual(-1);
        expect(comparators.stringComparator2Desc('a', null)).toEqual(1);
        expect(comparators.stringComparator2Desc(null, 'b')).toEqual(-1);
        expect(comparators.stringComparator2Desc(null, null)).toEqual(0);
        expect(comparators.stringComparator2Desc('a', 'a')).toEqual(0);
    });

    it('should apply number Comparator 2 Asc', () => {
        expect(comparators.numberComparator2Asc(1, 0)).toEqual(1);
        expect(comparators.numberComparator2Asc(0, 1)).toEqual(-1);
        expect(comparators.numberComparator2Asc(1, null)).toEqual(1);
        expect(comparators.numberComparator2Asc(null, 1)).toEqual(-1);
        expect(comparators.numberComparator2Asc(null, null)).toEqual(0);
        expect(comparators.numberComparator2Desc(1, 1)).toEqual(0);
    });

    it('should apply number Comparator 2 Desc', () => {
        expect(comparators.numberComparator2Desc(1, 0)).toEqual(-1);
        expect(comparators.numberComparator2Desc(0, 1)).toEqual(1);
        expect(comparators.numberComparator2Desc(1, null)).toEqual(-1);
        expect(comparators.numberComparator2Desc(null, 1)).toEqual(1);
        expect(comparators.numberComparator2Desc(null, null)).toEqual(0);
        expect(comparators.numberComparator2Desc(1, 1)).toEqual(0);
    });

    it('should apply duration Comparator 2 Asc', () => {
        expect(comparators.durationComparator2Asc('P1m', 'P1D')).toEqual(-86400000);
        expect(comparators.durationComparator2Asc('P1D', 'P1m')).toEqual(86400000);
        expect(comparators.durationComparator2Asc('P1m', null)).toEqual(1);
        expect(comparators.durationComparator2Asc(null, 'P1m')).toEqual(-1);
        expect(comparators.durationComparator2Asc(null, null)).toEqual(0);
        expect(comparators.durationComparator2Asc('P1m', 'P1m')).toEqual(0);
    });
});
