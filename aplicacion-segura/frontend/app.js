document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api';

  // Elementos de la UI
  const authView = document.getElementById('auth-view');
  const productsView = document.getElementById('products-view');
  const userSession = document.getElementById('user-session');
  const welcomeMessage = document.getElementById('welcome-message');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const productForm = document.getElementById('product-form');
  const logoutBtn = document.getElementById('logout-btn');

  const myProductsList = document.getElementById('my-products-list');
  const allProductsList = document.getElementById('all-products-list');

  // --- Funciones auxiliares ---
  const api = {
    call: async (endpoint, method = 'GET', body = null) => {
      const options = {
        method,
        headers: {},
        credentials: 'include' // importante para enviar cookies
      };
      if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
      try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (response.status === 204 || response.status === 401 || response.status === 403) {
          return { ok: response.ok, status: response.status };
        }
        const data = await response.json();
        return { ok: response.ok, data, status: response.status };
      } catch (error) {
        console.error('Error de red:', error);
        return { ok: false, data: { error: 'Error de red' } };
      }
    }
  };

  const updateUI = (isLoggedIn, username = '') => {
    if (isLoggedIn) {
      authView.classList.add('hidden');
      productsView.classList.remove('hidden');
      userSession.classList.remove('hidden');
      welcomeMessage.textContent = `Bienvenido, ${username}`;
      loadProducts();
    } else {
      authView.classList.remove('hidden');
      productsView.classList.add('hidden');
      userSession.classList.add('hidden');
      welcomeMessage.textContent = '';
    }
  };

  const loadProducts = async () => {
    const allRes = await api.call('/products');
    if (allRes.ok) renderProducts(allProductsList, allRes.data.products);

    const myRes = await api.call('/products/my');
    if (myRes.ok) renderProducts(myProductsList, myRes.data.myProducts, true);
  };

  const renderProducts = (element, products, isMy = false) => {
    element.innerHTML = products.map(p => `
      <div class="product-item" data-id="${p.id}">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        ${isMy ? `
        <div class="actions">
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </div>` : `<small>Propietario: ${p.owner}</small>`}
      </div>
    `).join('');
  };

  // --- Eventos ---
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const res = await api.call('/auth/login', 'POST', { username, password });
    if (res.ok) updateUI(true, username);
    else alert(res.data.error || 'Error en inicio de sesión');
  });

  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const res = await api.call('/auth/register', 'POST', { username, password });
    alert(res.data.message || res.data.error);
  });

  logoutBtn.addEventListener('click', async () => {
    const res = await api.call('/auth/logout', 'POST');
    if (res.ok) updateUI(false);
  });

  productForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;

    const endpoint = id ? `/products/${id}` : '/products';
    const method = id ? 'PUT' : 'POST';
    const res = await api.call(endpoint, method, { name, description });

    if (res.ok) {
      alert(id ? 'Producto actualizado' : 'Producto creado');
      productForm.reset();
      loadProducts();
    } else {
      alert(res.data.error || 'Error al guardar producto');
    }
  });

  // --- Delegación de eventos para editar/eliminar ---
  myProductsList.addEventListener('click', async e => {
    const item = e.target.closest('.product-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.classList.contains('edit-btn')) {
      const name = item.querySelector('h3').textContent;
      const description = item.querySelector('p').textContent;
      document.getElementById('product-id').value = id;
      document.getElementById('product-name').value = name;
      document.getElementById('product-description').value = description;
    }

    if (e.target.classList.contains('delete-btn')) {
      if (confirm('¿Eliminar este producto?')) {
        const res = await api.call(`/products/${id}`, 'DELETE');
        if (res.ok) {
          alert('Producto eliminado');
          loadProducts();
        } else {
          alert(res.data.error || 'Error al eliminar');
        }
      }
    }
  });
});
