'use strict';

const _ = require('lodash');

const COLUMNS_COUNT = 7;
const ROWS_COUNT = 6;
const COLUMNS_DELIMITER = ',';
const TARGET_LENGTH = 4;

/**
 * Game's field matrix.
 *
 * @param {Field} [field] Field to copy
 */
function Field(field) {
    let that = this;

    this.columns = [...new Array(COLUMNS_COUNT)]
        .map(() => [...new Array(ROWS_COUNT)]);

    if (field instanceof Field) {
        field.columns.forEach((column, i) => {
            column.forEach((cell, j) => {
                that.columns[i][j] = cell;
            });
        });

        this._player = field._player;
    }
}

module.exports = Field;

/**
 * Fills the field with specified cells.
 *
 * @param {string} cells
 * @param {string} player
 */
Field.prototype.fill = function (cells, player) {
    let that = this;

    cells.split(COLUMNS_DELIMITER)
        .slice(0, COLUMNS_COUNT)
        .forEach((columnString, i) => {
            columnString.split('')
                .slice(0, ROWS_COUNT)
                .forEach((cell, j) => {
                    that.columns[i][j] = cell;
                });
        });

    this._player = player;
};

/**
 * Calculates is specified step successful.
 *
 * @returns {boolean}
 */
Field.prototype.isSuccessful = function (player, columnIndex) {
    let field = this._getNextStepFieldOrNull(player, columnIndex);
    //console.log(field);
    if (!field) {
        return false;
    }

    if (field._hasWon(player)) {
        return this._player === player;
    }

    let columnsIndexes = this.columns
        .map((column, columnIndex) => columnIndex);
    let anotherPlayer = this._getAnotherPlayer(player);
    let isColumnIndexSuccessful = field.isSuccessful.bind(field, anotherPlayer);
    if (this._player === player) {
        return columnsIndexes.some(isColumnIndexSuccessful);
    } else {
        return columnsIndexes.every(isColumnIndexSuccessful);
    }
};

/**
 * @returns {boolean} Is it possible to do such step
 */
Field.prototype._doStep = function (player, columnIndex) {
    const column = this.columns[columnIndex];
    const rowIndex = column.findIndex((cell) => typeof cell !== 'string');

    if (rowIndex < 0) {
        return false;
    }

    column[rowIndex] = player;
    return true;
};

Field.prototype._getAnotherPlayer = function (player) {
    return player === 'y' ? 'r' : 'y';
};

/**
 * @returns {Field|null}
 */
Field.prototype._getNextStepFieldOrNull = function (player, columnIndex) {
    let field = new Field(this);
    return field._doStep(player, columnIndex) ? field : null;
};

Field.prototype._processDirections = function (process) {
    let that = this;
    return [
        process(0, -TARGET_LENGTH + 1, 0, ROWS_COUNT, (i, j, k) => that.columns[i + k][j]),
        process(0, COLUMNS_COUNT, 0, -TARGET_LENGTH + 1, (i, j, k) => that.columns[i][j + k]),
        process(0, -TARGET_LENGTH + 1, 0, -TARGET_LENGTH + 1, (i, j, k) => {
            return that.columns[i + k][j + k];
        }),
        process(0, -TARGET_LENGTH + 1, TARGET_LENGTH - 1, ROWS_COUNT, (i, j, k) => {
            return that.columns[i + k][j - k];
        }),
    ];
};

Field.prototype._hasWon = function (player) {
    return this._processDirections(this._hasDirectionWon.bind(this, player))
        .some(Boolean);
};

Field.prototype._hasDirectionWon = function (player, columnsBegin, columnsEnd, rowsBegin, rowsEnd, getCell) {
    return this.columns
        .slice(columnsBegin, columnsEnd)
        .some((column, i) => {
            i += columnsBegin;
            return column
                .slice(rowsBegin, rowsEnd)
                .some((cell, j) => {
                    j += rowsBegin;
                    for (let k = 0; k < TARGET_LENGTH; ++k) {
                        if (getCell(i, j, k) !== player) {
                            return false;
                        }
                    }
                    return true;
                });
        });
};

Field.prototype.getStepAnalysis = function (player) {
    const that = this;
    return this.columns.map((column, columnIndex) => {
        const analytics = that._getStepAnalysis(player, columnIndex, 6);
        if (analytics) {
            analytics.columnIndex = columnIndex;
        }
        return analytics;
    });
};

/**
 * @returns {Object|null} `null`, if we can't do such step.
 */
Field.prototype._getStepAnalysis = function (player, columnIndex, depth) { // yyyryy,yyryrr,ryryry,yryryr,rryr,rryryr,ryry y -- это вообще-то не проигрыш. Оч. странно.
    const field = this._getNextStepFieldOrNull(player, columnIndex);

    if (!field) {
        return null;
    }

    const analytics = {};

    if (field._hasWon(player)) {
        analytics.wins = player;
        return analytics;
    }

    analytics.probableWinsCount = field._getProbableWinsCount(player, columnIndex);

    if (--depth <= 0) {
        return analytics;
    }

    const anotherPlayer = this._getAnotherPlayer(player);
    const analyticses = this.columns
        .map((column, columnIndex) => field._getStepAnalysis(anotherPlayer, columnIndex, depth));
    if (analyticses.some((analytics) => analytics && analytics.wins === anotherPlayer)) {
        analytics.wins = anotherPlayer;
    } else if (analyticses.every((analytics) => !analytics || analytics.wins === player)) {
        analytics.wins = player;
    }
    analytics.anotherProbableWinsCount = _.max(_.map(analyticses, 'probableWinsCount'));
    return analytics;
};

Field.prototype._getProbableWinsCount = function (player, columnIndex) {
    const rowIndex = this._getRowIndex(columnIndex);
    const getDirectionProbableWinsCount = this._getDirectionProbableWinsCount.bind(this, player);

    return getDirectionProbableWinsCount((offset) => columnIndex + offset, (offset) => rowIndex) +
           getDirectionProbableWinsCount((offset) => columnIndex,          (offset) => rowIndex + offset) +
           getDirectionProbableWinsCount((offset) => columnIndex + offset, (offset) => rowIndex + offset) +
           getDirectionProbableWinsCount((offset) => columnIndex + offset, (offset) => rowIndex - offset);
};

Field.prototype._getDirectionProbableWinsCount = function (player, getColumnIndex, getRowIndex) {
    const that = this;

    let positiveOffset;
    for (positiveOffset = 1; positiveOffset < TARGET_LENGTH; ++positiveOffset) {
        const columnIndex = getColumnIndex(positiveOffset);
        const rowIndex = getRowIndex(positiveOffset);

        if (!isIndexesOk(columnIndex, rowIndex) || !isCellOk(columnIndex, rowIndex)) {
            break;
        }
    }

    let negativeOffset;
    for (negativeOffset = -1; negativeOffset > -TARGET_LENGTH; --negativeOffset) {
        const columnIndex = getColumnIndex(negativeOffset);
        const rowIndex = getRowIndex(negativeOffset);

        if (!isIndexesOk(columnIndex, rowIndex) || !isCellOk(columnIndex, rowIndex)) {
            break;
        }
    }

    return Math.max(0, positiveOffset - negativeOffset - TARGET_LENGTH);

    function isIndexesOk(columnIndex, rowIndex) {
        return columnIndex >= 0 && columnIndex < COLUMNS_COUNT &&
            rowIndex >= 0 && rowIndex < ROWS_COUNT;
    }

    function isCellOk(columnIndex, rowIndex) {
        const cell = that.columns[columnIndex][rowIndex];
        return cell === player || typeof cell !== 'string';
    }
};

/**
 * @param {number} columnIndex Column index.
 * @returns {number} Index of the topmost ball.
 */
Field.prototype._getRowIndex = function (columnIndex) {
    const column = this.columns[columnIndex];
    let index = _.findIndex(column, (cell) => typeof cell !== 'string');

    if (index < 0) {
        return column.length - 1;
    } else if (index == 0) {
        throw 'Unexpected';
    }

    return index - 1;
};
