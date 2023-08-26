import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom'
import Details from './Details'
import { Layout } from './Layout'
import { Cart } from './Cart'
import App from './App'


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
            }              
        ]
    },
])

export function Routes() {
    return <RouterProvider router={router}></RouterProvider>
}

export default Routes