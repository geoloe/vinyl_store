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


const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <App/>
            },
            {
                path: 'details/:releaseId/:priceId',
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
                element: <RegistrationForm></RegistrationForm>
            },
            {
                path: 'login/?oauth_token=:OAuthToken?oauth_verifier=:oAuthVerifier',
                element: <Welcome/>
            }                
        ]
    },
])

export function Routes() {
    return <RouterProvider router={router}></RouterProvider>
}

export default Routes