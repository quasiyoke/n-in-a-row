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
    let analyticses = field.getStepAnalysis(player);
    console.log(analyticses);
    analyticses = analyticses.filter(Boolean);
    const winning = analyticses.filter((analytics) => analytics.wins === player);

    if (winning.length) {
        analyticses = winning;
    } else {
        analyticses = analyticses.filter((analytics) => typeof analytics.wins !== 'string');
    }

    if (!analyticses.length) {
        console.log('We lose :(');
        return;
    }

    showBest(analyticses, (analytics) => analytics.probableWinsCount, 'probableWinsCount');
    showBest(analyticses, (analytics) => analytics.probableWinsCount / analytics.anotherProbableWinsCount, 'ratio');
}

function showBest(analyticses, getValue, name) {
    const best = _.maxBy(analyticses, getValue);
    const bestValue = getValue(best);
    console.log(`The best by ${name} is ${best.columnIndex}: ${bestValue}`);
}
