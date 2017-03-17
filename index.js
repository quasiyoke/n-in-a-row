'use strict';

const _ = require('lodash');
const console = require('console');
const Field = require('./field');

main();

function main() {
    let [, , cells, player] = process.argv;
    if (typeof player !== 'string' || player.length !== 1) {
        console.error('Please specify player: `y` or `r`.');
        return;
    }

    let field = new Field();
    field.fill(cells, player);

    analyzeField(field, player);
    let columnIndex = getSuccessfulColumnIndex(field, player);
    if (isFinite(columnIndex)) {
        console.log(columnIndex);
    } else {
        console.log('There\'s no success strategy :(');
    }
}

function analyzeField(field, player) {
    field.columns.forEach((column, columnIndex) => {
        let analysis = field.analyzeStep(player, columnIndex);
        console.log(`Step ${columnIndex} analysis: ${analysis}`);
    });
}

/**
 * @param {Field} field
 * @param {string} player
 * @returns {number|undefined} First "winning" column index. If there's no such column returns `undefined`.
 */
function getSuccessfulColumnIndex(field, player) {
    return field.columns
        .map((column, columnIndex) => columnIndex)
        .find(field.isSuccessful.bind(field, player));
}
