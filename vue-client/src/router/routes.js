import Problems from "@/pages/Problems"

const routes = [
    {
      path: '*',
      redirect: '/'
    },
    {
<<<<<<< HEAD
      path: '/Problems',
      name: 'Problems',
      component: () => import("@/pages/Problems"),
      meta: { requiresAuth: true }
    },
    {
      path: '/Problems/:id',
      name: 'ProblemDetails',
      component: () => import("@/pages/ProblemDetails"),
      meta: { requiresAuth: true }
=======
        path: '/Problems',
        name: 'Problems',
        component: Problems,
        meta: { requiresAuth: true }
    },
    {
        path: '/Problem/:id',
        name: 'ProblemDetails',
        component: () => import("@/pages/ProblemDetails"),
        meta: { requiresAuth: true }
>>>>>>> 1e784655a04c334244adcb632ae8db2e87a27909
    },
    {
      path: '/AddProblem',
      name: 'AddProblem',
      component: () => import("@/pages/AddProblem"),
      meta: { requiresAuth: true }
    },
    {
<<<<<<< HEAD
      path: '/',
      name: 'Login',
      component: () => import("@/pages/Login")
    },
    {
      path: '/register',
      name: 'SignUp',
      component: () => import("@/pages/SignUp")
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import("@/pages/ForgotPassword")
=======
        path: '/Editor',
        name: 'Editor',
        component: () => import("@/components/Editor"),
        meta: { requiresAuthOrAnonymousTest: true }
    },
    {
        path: '/',
        name: 'Login',
        component: () => import("@/pages/Login")
    },
    {
        path: '/register',
        name: 'SignUp',
        component: () => import("@/pages/SignUp")
    },
    {
        path: '/AddClient',
        name: 'Client',
        component: () => import("@/pages/AddClients"),
        meta: { requiresAuth: true }
    },
    {
        path: '/UpdateAccount',
        name: 'UpdateAccount',
        component: () => import("@/pages/UpdateAccount"),
        meta: { requiresAuth: true }
>>>>>>> 1e784655a04c334244adcb632ae8db2e87a27909
    }
]

export default routes
