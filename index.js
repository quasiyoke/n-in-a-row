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
}

function analyzeField(field, player) {
    let analytics = field.columns.map((column, columnIndex) => {
        let analysis = field.analyzeStep(player, columnIndex);
        analysis.columnIndex = columnIndex;
        console.log(`Step ${columnIndex} analysis: `, analysis);
        return analysis;
    });
    let best = _.maxBy(analytics, 'points.yr');
    console.log(`The best is ${best.columnIndex}`);
}
