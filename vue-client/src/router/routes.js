const routes = [
    {
      path: '*',
      redirect: '/'
    },
    {
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
    },
    {
      path: '/AddProblem',
      name: 'AddProblem',
      component: () => import("@/pages/AddProblem"),
      meta: { requiresAuth: true }
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
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: () => import("@/pages/ForgotPassword")
    }
]

export default routes
