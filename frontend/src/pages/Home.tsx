import { Navigate, useOutletContext } from "react-router-dom";
import type { TUser } from "../validation";
const Home = () => {
  const user = useOutletContext<{ user: TUser }>();
  if(!user) {
    return <Navigate to="/user/signup" replace />;
  }
  return (
    <div>Home</div>
  )
}

export default Home;
