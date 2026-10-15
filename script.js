const productContainer = document.querySelector('#product-container');

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	})[character]);
}

function renderProduct(product) {
	const title = escapeHtml(product.title);
	const image = escapeHtml(product.images?.[0] || product.thumbnail || '');
	const brand = escapeHtml(product.brand || 'SocMark');
	const category = escapeHtml(product.category || 'Produk');
	const description = escapeHtml(product.description || '');
	const availability = escapeHtml(product.availabilityStatus || 'Status tidak tersedia');
	const price = Number(product.price);
	const discount = Number(product.discountPercentage) || 0;
	const discountedPrice = price * (1 - discount / 100);
	const rating = Number(product.rating);
	const stock = Number(product.stock);

	return `
		<article class="product-card" aria-label="${title}">
			<div class="product-visual">
				<span class="product-category">${category}</span>
				${discount > 0 ? `<span class="product-discount">-${discount.toFixed(2)}%</span>` : ''}
				<img class="product-image" src="${image}" alt="${title}" loading="lazy">
			</div>
			<div class="product-info">
				<div class="product-brand-row">
					<span class="product-brand-name">${brand}</span>
					<span class="product-rating" aria-label="Rating ${rating.toFixed(1)} dari 5">★ ${rating.toFixed(1)}</span>
				</div>
				<h2 class="product-title">${title}</h2>
				<p class="product-description">${description}</p>
				<div class="product-price-row">
					<strong class="product-price">$${discountedPrice.toFixed(2)}</strong>
					${discount > 0 ? `<span class="product-original-price">$${price.toFixed(2)}</span>` : ''}
				</div>
				<div class="product-card-footer">
					<span class="product-stock ${stock > 0 ? 'is-in-stock' : 'is-out-of-stock'}">
						<span class="product-stock-dot"></span>${availability} · ${stock} tersedia
					</span>
					<span class="product-sku">SKU ${escapeHtml(product.sku || '-')}</span>
				</div>
			</div>
		</article>
	`;
	}

function renderProducts(products) {
	productContainer.innerHTML = products.map(renderProduct).join('');
	productContainer.setAttribute('aria-busy', 'false');
}

fetch('https://dummyjson.com/products?limit=25')
	.then(response => {
		if (!response.ok) throw new Error('Daftar produk tidak dapat dimuat.');
		return response.json();
	})
	.then(data => renderProducts(data.products || []))
	.catch(() => {
		productContainer.innerHTML = '<p class="product-state product-error">Daftar produk gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.</p>';
		productContainer.setAttribute('aria-busy', 'false');
	});
