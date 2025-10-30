const routes = [
   // Rutas principales
   { path: '/', component: 'HomePage', metadata: {} },
   { path: '/practice/${deckId}', component: 'Tester', metadata: {} },
   { path: '/start', component: 'StartPage', metadata: { requiresNoSettings: true} },
   { path: '/404', component: 'NotFound', metadata: {} },

];



export default routes;