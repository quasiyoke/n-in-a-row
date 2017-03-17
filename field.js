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
    let that = this;
    let rowIndex = this.columns[columnIndex]
        .map((cell, rowIndex) => rowIndex)
        .find((rowIndex) => typeof that.columns[columnIndex][rowIndex] !== 'string');

    //console.log(rowIndex);
    if (isFinite(rowIndex)) {
        this.columns[columnIndex][rowIndex] = player;
        return true;
    } else {
        return false;
    }
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

Field.prototype._hasWon = function (player) {
    let that = this;
    return this._hasDirectionWon(player, 0, -TARGET_LENGTH, 0, ROWS_COUNT, (i, j, k) => that.columns[i + k][j]) ||
        this._hasDirectionWon(player, 0, COLUMNS_COUNT, 0, -TARGET_LENGTH, (i, j, k) => that.columns[i][j + k]) ||
        this._hasDirectionWon(player, 0, -TARGET_LENGTH, 0, -TARGET_LENGTH, (i, j, k) => {
            return that.columns[i + k][j + k];
        }) ||
        this._hasDirectionWon(player, 0, COLUMNS_COUNT, 0, -TARGET_LENGTH, (i, j, k) => {
            return that.columns[i][j + k];
        });
};

Field.prototype._hasDirectionWon = function (player, columnsBegin, columnsEnd, rowsBegin, rowsEnd, getCell) {
    return this.columns
        .slice(columnsBegin, columnsEnd)
        .some((column, i) => {
            return column
                .slice(rowsBegin, rowsEnd)
                .some((cell, j) => {
                    for (let k = 0; k < TARGET_LENGTH; ++k) {
                        if (getCell(i, j, k) !== player) {
                            return false;
                        }
                    }
                    return true;
                });
        });
};
