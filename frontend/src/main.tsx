import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SignUp from './pages/signUp'
import Login from './pages/Login'
import './index.css'
import { RouterProvider,createBrowserRouter} from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

const approuter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
     
      {
        element: <PublicRoute />,
        children: [
          { path: "user/signup", element: <SignUp /> },
          { path: "user/login", element: <Login /> },
        ],
      },

      
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/", element: <Home /> },
          
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={approuter} />
  </StrictMode>,
)
