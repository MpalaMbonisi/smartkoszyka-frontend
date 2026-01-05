export const environment = {
  production: false,
  apiUrl: 'http://35.159.222.210',
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
