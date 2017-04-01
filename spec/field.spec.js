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

        it('Detects horizontal wins on the left', () => {
            field.fill('y,y,y,y');
            expect(field._hasWon('r')).toBe(false);
            expect(field._hasWon('y')).toBe(true);
        });

        it('Detects horizontal wins on the right', () => {
            field.fill(',,,r,r,r,r');
            expect(field._hasWon('r')).toBe(true);
            expect(field._hasWon('y')).toBe(false);
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

    describe('`._getProbableWinsCount()`', () => {
        it('Works right in column 0', () => {
            field.fill('y');
            expect(field._getProbableWinsCount('y', 0)).toBe(3);
        });
        it('Works right in column 1', () => {
            field.fill(',r');
            expect(field._getProbableWinsCount('r', 1)).toBe(4);
        });
        it('Works right in column 2', () => {
            field.fill(',,y');
            expect(field._getProbableWinsCount('y', 2)).toBe(5);
        });
        it('Works right in point 3, 2', () => {
            field.fill(',,,rrr');
            expect(field._getProbableWinsCount('r', 3)).toBe(13);
        });
        it('Works right in point 3, 3', () => {
            field.fill(',,,rrrr');
            expect(field._getProbableWinsCount('r', 3)).toBe(13);
        });
        it('Works right in point 6, 5', () => {
            field.fill(',,,,,,rrrrrr');
            expect(field._getProbableWinsCount('r', 6)).toBe(3);
        });
        it('Checks for foreign cells horizontally on the right', () => {
            field.fill('y,,,r');
            expect(field._getProbableWinsCount('y', 0)).toBe(2);
        });
        it('Checks for foreign cells horizontally on the left', () => {
            field.fill(',,,r,,,y');
            expect(field._getProbableWinsCount('y', 6)).toBe(2);
        });
        it('Checks for foreign cells vertically on the bottom', () => {
            field.fill('yyyrrr');
            expect(field._getProbableWinsCount('r', 0)).toBe(2);
        });
        it('Checks for foreign cells up diagonally on the right', () => {
            field.fill('y,,,yyyr');
            expect(field._getProbableWinsCount('y', 0)).toBe(2);
        });
        it('Checks for foreign cells up diagonally on the left', () => {
            field.fill(',,,yyy,,,rrrrrr');
            expect(field._getProbableWinsCount('r', 6)).toBe(2);
        });
        it('Checks for foreign cells down diagonally on the right', () => {
            field.fill('yyyyyy,,,yyr');
            expect(field._getProbableWinsCount('y', 0)).toBe(2);
        });
        it('Checks for foreign cells down diagonally on the left', () => {
            field.fill(',,,rrry,,,r');
            expect(field._getProbableWinsCount('r', 6)).toBe(2);
        });
    });

    describe('`._getRowIndex()`', () => {
        it('Throws on empty column', () => {
            expect(() => field._getRowIndex(0)).toThrow();
        });
        it('Works right usually', () => {
            field.fill('yyyy');
            expect(field._getRowIndex(0)).toBe(3);
        });
        it('Works right with full column', () => {
            field.fill('yyyyyy');
            expect(field._getRowIndex(0)).toBe(5);
        });
    });

    describe('`._doStep()`', () => {
        it('Works good on empty column', () => {
            expect(field._doStep('y', 0)).toBe(true);
            expect(field.columns[0]).toEqual(['y', undefined, undefined, undefined, undefined, undefined]);
        });
        it('Works good on usual column', () => {
            field.fill('yyyyyy,yy,yyy');
            expect(field._doStep('r', 1)).toBe(true);
            expect(field.columns[1]).toEqual(['y', 'y', 'r', undefined, undefined, undefined]);
        });
        it('Returns `false` for full column', () => {
            field.fill('y,yyyyyy,yy,yyy');
            expect(field._doStep('r', 1)).toBe(false);
        });
    });

    xdescribe('efefe', () => {
        it('gfregr', () => {
            field.fill(',y,,ryy,r,r');
            expect(field._getStepAnalysis('y', 2, 2)).toEqual({
                probableWinsCount: 2,
                anotherProbableWinsCount: 10,
                wins: 'r'
            });
        });
    });
});
