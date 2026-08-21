document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('products-container');

    Promise.all([
        fetch('categories.json').then(res => res.json()),
        fetch('types.json').then(res => res.json()),
        fetch('products.json').then(res => res.json())
    ])
    .then(([categoriesData, typesData, productsData]) => {
        const categories = categoriesData.categories;
        const types = typesData.types;
        // productsData.products is an array containing an object with dynamic keys
        const productsDict = productsData.products[0];

        const categoriesMap = new Map();
        categories.forEach(c => categoriesMap.set(c.id, c));

        const typesMap = new Map();
        types.forEach(t => typesMap.set(t.id, t));

        for (const key in productsDict) {
            if (productsDict.hasOwnProperty(key)) {
                const product = productsDict[key];

                // Find matching type and category
                const type = typesMap.get(product.type);
                const category = type ? categoriesMap.get(type.category) : null;

                const card = document.createElement('div');
                card.className = 'card';

                const nameEl = document.createElement('h3');
                nameEl.textContent = product.name;

                const descEl = document.createElement('p');
                descEl.className = 'description';
                descEl.textContent = product.description;

                const typeEl = document.createElement('p');
                typeEl.className = 'type';
                const typeStrong = document.createElement('strong');
                typeStrong.textContent = 'Type:';
                typeEl.appendChild(typeStrong);
                typeEl.appendChild(document.createTextNode(` ${type ? type.name : 'Unknown'}`));

                const categoryEl = document.createElement('p');
                categoryEl.className = 'category';
                const categoryStrong = document.createElement('strong');
                categoryStrong.textContent = 'Category:';
                categoryEl.appendChild(categoryStrong);
                categoryEl.appendChild(document.createTextNode(` ${category ? category.name : 'Unknown'}`));

                card.appendChild(nameEl);
                card.appendChild(typeEl);
                card.appendChild(categoryEl);
                card.appendChild(descEl);

                container.appendChild(card);
            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        container.innerHTML = '<p>Error loading products.</p>';
    });
});
