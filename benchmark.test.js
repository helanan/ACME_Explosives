const test = require('node:test');
const assert = require('node:assert');
const { runBaseline, runOptimized } = require('./benchmark.js');

test('benchmark tests', async (t) => {
    await t.test('runBaseline should execute without errors and return a number', () => {
        const result = runBaseline();
        assert.strictEqual(typeof result, 'number', 'runBaseline should return a number (ms)');
        assert.ok(result >= 0, 'runBaseline should return a non-negative number');
    });

    await t.test('runOptimized should execute without errors and return a number', () => {
        const result = runOptimized();
        assert.strictEqual(typeof result, 'number', 'runOptimized should return a number (ms)');
        assert.ok(result >= 0, 'runOptimized should return a non-negative number');
    });
});
