import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SignUp from './pages/signUp'
import Login from './pages/Login'
import './index.css'
import { RouterProvider,createBrowserRouter} from 'react-router-dom'
import App from './App'
import Home from './pages/Home'


const approuter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children:[
      {
        path:'user/signup',
        element:<SignUp />
      },
      {
        path:'user/login',
        element:<Login />
      },{
        path:'/',
        element:<Home />, 
      }

    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={approuter} />
  </StrictMode>,
)
