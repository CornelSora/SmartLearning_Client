import Problems from "@/pages/Problems"

const routes = [
    {
        path: '*',
        redirect: '/'
    },
    {
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
    },
    {
        path: '/AddProblem',
        name: 'AddProblem',
        component: () => import("@/pages/AddProblem"),
        meta: { requiresAuth: true }
    },
    {
        path: '/Editor',
        name: 'Editor',
        component: () => import("@/components/Editor"),
        meta: { authOrTest: true }
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
]

export default routes