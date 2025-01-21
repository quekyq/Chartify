import { Outlet } from "react-router-dom"
import NavBar from "../components/NavBar"

const MainLayout = () => {
  return (
    <>  
        <NavBar />
        <Outlet></Outlet>
    </>
  )
}

export default MainLayout
