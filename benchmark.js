const fs = require('fs');

const categoriesData = JSON.parse(fs.readFileSync('categories.json', 'utf8'));
const typesData = JSON.parse(fs.readFileSync('types.json', 'utf8'));
const productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));

// Generate large data for benchmark
const categories = [];
for (let i = 0; i < 100; i++) {
    categories.push({id: i, name: `Category ${i}`});
}

const types = [];
for (let i = 0; i < 1000; i++) {
    types.push({id: i, category: i % 100, name: `Type ${i}`});
}

const productsDict = {};
for (let i = 0; i < 10000; i++) {
    productsDict[`product_${i}`] = {id: i, type: i % 1000, name: `Product ${i}`, description: `Desc ${i}`};
}

function runBaseline() {
    const start = process.hrtime.bigint();

    let count = 0;
    for (const key in productsDict) {
        if (productsDict.hasOwnProperty(key)) {
            const product = productsDict[key];
            const type = types.find(t => t.id === product.type);
            const category = type ? categories.find(c => c.id === type.category) : null;
            if (type && category) count++;
        }
    }

    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // ms
}

function runOptimized() {
    const start = process.hrtime.bigint();

    // Convert to dictionaries/maps
    const categoryMap = new Map();
    for (const c of categories) categoryMap.set(c.id, c);

    const typeMap = new Map();
    for (const t of types) typeMap.set(t.id, t);

    let count = 0;
    for (const key in productsDict) {
        if (productsDict.hasOwnProperty(key)) {
            const product = productsDict[key];
            const type = typeMap.get(product.type);
            const category = type ? categoryMap.get(type.category) : null;
            if (type && category) count++;
        }
    }

    const end = process.hrtime.bigint();
    return Number(end - start) / 1000000; // ms
}

// Warm up
runBaseline();
runOptimized();

let baselineTotal = 0;
let optimizedTotal = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
    baselineTotal += runBaseline();
    optimizedTotal += runOptimized();
}

console.log(`Baseline avg: ${baselineTotal / iterations} ms`);
console.log(`Optimized avg: ${optimizedTotal / iterations} ms`);
console.log(`Speedup: ${((baselineTotal / iterations) / (optimizedTotal / iterations)).toFixed(2)}x`);
