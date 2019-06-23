import Problems from "@/pages/Problems"

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
      path: '/Problem/:id',
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
    },
    {
      path: '/Editor',
      name: 'Editor',
      component: () => import("@/components/Editor"),
      meta: { requiresAuthOrAnonymousTest: true }
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
    },
    {
      path: '/Profile',
      name: 'Profile',
      component: () => import("@/pages/Profile"),
      meta: { requiresAuth: true }
    }
]

export default routes
