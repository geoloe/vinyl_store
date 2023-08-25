import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom'
import Details from './Details'
import { Layout } from './Layout'
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
                path: 'details/:id',
                element: <Details/>
            },
            {
                path: 'details',
                element: <Details/>
            }              
        ]
    },
])

export function Routes() {
    return <RouterProvider router={router}></RouterProvider>
}

export default Routes