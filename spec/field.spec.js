'use strict';

describe('`Field`', () => {
    const Field = require(process.cwd() + '/field');

    let field;

    beforeEach(() => {
        field = new Field();
    });

    describe('`.fill()`', () => {
        it('Fills columns', () => {
            field.fill(',,yrrry,yyyyyy,rrrr', 'y');
            expect(field.columns).toEqual([
                [undefined, undefined, undefined, undefined, undefined, undefined],
                [undefined, undefined, undefined, undefined, undefined, undefined],
                ['y', 'r', 'r', 'r', 'y', undefined],
                ['y', 'y', 'y', 'y', 'y', 'y'],
                ['r', 'r', 'r', 'r', undefined, undefined],
                [undefined, undefined, undefined, undefined, undefined, undefined],
                [undefined, undefined, undefined, undefined, undefined, undefined],
            ]);
        });

        it('Sets `_player`', () => {
            field.fill(',', 'y');
            expect(field._player).toEqual('y');
        });
    });

    describe('`._hasWon()`', () => {
        it('Hasn\'t false positives', () => {
            field.fill('ryyy,r,r');
            expect(field._hasWon('r')).toBe(false);
            expect(field._hasWon('y')).toBe(false);
        });

        it('Detects vertical wins', () => {
            field.fill('yyyy');
            expect(field._hasWon('r')).toBe(false);
            expect(field._hasWon('y')).toBe(true);
            field.fill('rrrr');
            expect(field._hasWon('r')).toBe(true);
            expect(field._hasWon('y')).toBe(false);
        });

        it('Detects horizontal wins', () => {
            field.fill('y,y,y,y');
            expect(field._hasWon('r')).toBe(false);
            expect(field._hasWon('y')).toBe(true);
        });

        it('Detects up diagonal wins', () => {
            field.fill(',,y,ry,rry,rrry');
            expect(field._hasWon('r')).toBe(false);
            expect(field._hasWon('y')).toBe(true);
        });

        it('Detects down diagonal wins', () => {
            field.fill(',,rrry,rry,ry,y');
            expect(field._hasWon('r')).toBe(false);
            expect(field._hasWon('y')).toBe(true);
        });
    });

    describe('`._getPoints()`', () => {
        it('Zero on empty field', () => {
            field.fill(',');
            expect(field._getPoints('r')).toBe(0);
            expect(field._getPoints('y')).toBe(0);
        });

        it('Counts single cell correctly', () => {
            field.fill('y');
            expect(field._getPoints('r')).toBe(0);
            expect(field._getPoints('y')).toBe(1 + 1 + 1);
        });

        it('Calculates double vertical cell correctly', () => {
            field.fill('rr');
            expect(field._getPoints('r')).toBe((1 + 2) + (1 + 1) + (1 + 1));
            expect(field._getPoints('y')).toBe(0);
        });

        it('Calculates vertical win correctly', () => {
            field.fill('yyyy');
            expect(field._getPoints('r')).toBe(0);
            expect(field._getPoints('y')).toBe(19);
        });

        it('Calculates horizontal win correctly', () => {
            field.fill('r,r,r,r');
            expect(field._getPoints('r')).toBe(21);
            expect(field._getPoints('y')).toBe(0);
        });

        it('Calculates up diagonal win correctly', () => {
            field.fill('y,ry,rry,rrry');
            expect(field._getPoints('r')).toBe(26);
            expect(field._getPoints('y')).toBe(17);
        });

        it('Calculates down diagonal win correctly', () => {
            field.fill('yyyr,yyr,yr,r');
            expect(field._getPoints('r')).toBe(14);
            expect(field._getPoints('y')).toBe(27);
        });
    });
});
