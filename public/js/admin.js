const deleteProduct = ( btn ) => {

	const prodId = btn.parentNode.querySelector('[name="productId"]').value;

	const productElement = btn.parentNode.closest('.card-list');

	fetch(`/admin/product/${prodId}`, {

		method: 'DELETE',
		credentials: 'same-origin',
		headers: {
			'csrf_token': 'sadasfsdafeefdsfccfsaddfasadar'
		}

	}).then((response) => {
		return response.json()
	}).then((data) => {
		productElement.parentNode.removeChild(productElement);
		console.log(data);
	}).catch((err) => {
		console.log(err);
	})

	
}

