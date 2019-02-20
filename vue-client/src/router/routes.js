const routes = [
    {
        path: '*',
        redirect: '/'
    },
    {
        path: '/Problems',
        name: 'Problems',
        component: () => import("@/components/Problems"),
        meta: { requiresAuth: true }
    },
    {
        path: '/Problem/:id',
        name: 'ProblemDetails',
        component: () => import("@/components/ProblemDetails"),
        meta: { requiresAuth: true }
    },
    {
        path: '/',
        name: 'Login',
        component: () => import("@/components/Login")
    },
    {
        path: '/register',
        name: 'SignUp',
        component: () => import("@/components/SignUp")
    }
]

export default routes