import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom'
import Details from './Details'
import { Layout } from './Layout'
import { Cart } from './Cart'
import { Login } from './Login'
import App from './App'
import { Welcome } from './Landing'
import { RegistrationForm } from './Components/RegistrationForm'
import { RegistrationPassword } from './Components/RegistrationPassword'
import { Dashboard } from './Dashboard'


const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <App/>
            },
            {
                path: 'details/:releaseId/:priceId/:statusId',
                element: <Details/>
            },
            {
                path: 'cart',
                element: <Cart/>
            },
            {
                path: 'login',
                element: <Login/>
            },
            {
                path: 'signup',
                element: <RegistrationForm></RegistrationForm>,
            },
            {
                path: 'forgot',
                element: <RegistrationPassword></RegistrationPassword>
            },
            {
                path: 'login/?oauth_token=:OAuthToken?oauth_verifier=:oAuthVerifier',
                element: <Welcome/>
            },
            {
                path: 'dashboard',
                element:  <Dashboard></Dashboard>
            }                
        ]
    },
])

export function Routes() {
    return <RouterProvider router={router}></RouterProvider>
}

export default Routes