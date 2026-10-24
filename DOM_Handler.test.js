const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('DOM_Handler.js error path', async (t) => {
    const scriptContent = fs.readFileSync(path.resolve(__dirname, 'DOM_Handler.js'), 'utf-8');

    let consoleErrorCalled = false;

    const virtualConsole = new (require('jsdom')).VirtualConsole();
    virtualConsole.on("error", () => {
        consoleErrorCalled = true;
    });

    const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <head>
            <script>
                // Mock fetch to reject
                window.fetch = () => Promise.reject(new Error('Fetch failed'));
            </script>
            <script>${scriptContent}</script>
        </head>
        <body>
            <div id="products-container"></div>
        </body>
        </html>
    `, { runScripts: 'dangerously', virtualConsole });

    // Wait for the microtask queue to process the rejected promise
    await new Promise(resolve => setTimeout(resolve, 50));

    const container = dom.window.document.getElementById('products-container');
    assert.ok(container, 'container should exist');
    assert.strictEqual(container.childNodes.length, 1, 'Container should have exactly one child');
    const p = container.firstChild;
    assert.strictEqual(p.tagName, 'P', 'Child should be a P element');
    assert.strictEqual(p.textContent, 'Error loading products.', 'Error message should be correct');
    assert.ok(consoleErrorCalled, 'console.error should be called');
});
