const test = require('node:test');
const assert = require('node:assert');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const scriptContent = fs.readFileSync(path.join(__dirname, 'DOM_Handler.js'), 'utf8');

test('DOM_Handler.js', async (t) => {
    await t.test('Happy path: fetches data and renders correctly', async () => {
        return new Promise((resolve) => {
            const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="products-container"></div></body></html>`, {
                runScripts: 'dangerously'
            });

            dom.window.fetch = async (url) => {
                if (url === 'categories.json') {
                    return { json: async () => ({ categories: [{ id: 1, name: 'Fireworks' }] }) };
                }
                if (url === 'types.json') {
                    return { json: async () => ({ types: [{ id: 10, category: 1, name: 'Personal' }] }) };
                }
                if (url === 'products.json') {
                    return { json: async () => ({
                        products: [{
                            prod1: { name: 'Roman Candle', description: 'Shoots fireballs', type: 10 }
                        }]
                    }) };
                }
                throw new Error(`Unexpected url: ${url}`);
            };

            const script = dom.window.document.createElement('script');
            script.textContent = scriptContent;
            dom.window.document.body.appendChild(script);

            dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

            setTimeout(() => {
                const container = dom.window.document.getElementById('products-container');
                const html = container.innerHTML;

                assert.ok(html.includes('Roman Candle'), 'Should render product name');
                assert.ok(html.includes('Shoots fireballs'), 'Should render description');
                assert.ok(html.includes('Personal'), 'Should render type name');
                assert.ok(html.includes('Fireworks'), 'Should render category name');

                resolve();
            }, 50);
        });
    });

    await t.test('Edge case: handles unknown types and categories', async () => {
        return new Promise((resolve) => {
            const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="products-container"></div></body></html>`, {
                runScripts: 'dangerously'
            });

            dom.window.fetch = async (url) => {
                if (url === 'categories.json') return { json: async () => ({ categories: [] }) };
                if (url === 'types.json') return { json: async () => ({ types: [] }) };
                if (url === 'products.json') return { json: async () => ({
                    products: [{
                        prod1: { name: 'Mystery Item', description: 'Unknown things', type: 999 }
                    }]
                }) };
                throw new Error(`Unexpected url: ${url}`);
            };

            const script = dom.window.document.createElement('script');
            script.textContent = scriptContent;
            dom.window.document.body.appendChild(script);

            dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

            setTimeout(() => {
                const container = dom.window.document.getElementById('products-container');
                const html = container.innerHTML;

                assert.ok(html.includes('Mystery Item'));
                assert.ok(html.includes('Type:</strong> Unknown'), 'Should render Unknown for type');
                assert.ok(html.includes('Category:</strong> Unknown'), 'Should render Unknown for category');

                resolve();
            }, 50);
        });
    });

    await t.test('Error path: renders error message when fetch fails', async () => {
        return new Promise((resolve) => {
            const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="products-container"></div></body></html>`, {
                runScripts: 'dangerously'
            });

            dom.window.fetch = async () => {
                throw new Error('Network failure');
            };

            const script = dom.window.document.createElement('script');
            script.textContent = scriptContent;
            dom.window.document.body.appendChild(script);

            dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

            setTimeout(() => {
                const container = dom.window.document.getElementById('products-container');
                const html = container.innerHTML;

                assert.ok(html.includes('Error loading products.'));

                resolve();
            }, 50);
        });
    });
});
