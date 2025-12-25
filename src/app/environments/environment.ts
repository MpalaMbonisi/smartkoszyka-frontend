export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  apiEndpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
    },
    shoppingLists: '/api/shopping-lists',
    products: '/api/products',
    categories: '/api/categories',
  },
};
