import { NavLink } from "react-router-dom"
// import { useState } from "react"
const NavBar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-orange-50 active:text-white focus:text-white rounded-md px-3 py-2'
      : 'text-violet-400 hover:text-rose-400 rounded-md px-3 py-2'

  return (
    // <nav className='bg-gradient-to-r from-red-800 to-indigo-600'>
    <nav>
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='flex h-28 items-center justify-between'>
          <div className='flex flex-1 items-center justify-center md:items-center md:justify-start'>
            <NavLink className='flex items-center mr-4 transition-transform hover:scale-105' to='/'>
              <span className='text-white text-4xl font-extrabold tracking-wider font-title'>
                Chartify
              </span>
            </NavLink>
            <div className='md:ml-auto'>
              <div className='flex space-x-4 text-1.5xl font-bold tracking-wider font-title'>
                <div>
                  <NavLink to='/' className={linkClass}>
                    Home
                  </NavLink>
                </div>
                <div className='relative'>
                  <NavLink to='/song' className={linkClass}>
                    Song
                  </NavLink>
                </div>

                <div className='relative'>
                  <NavLink to='/artist' className={linkClass}>
                    Artist
                  </NavLink>
                </div>

                <div className='relative'>
                  <NavLink to='/album' className={linkClass}>
                    Album
                  </NavLink>
                </div>

                <div className='relative'>
                  <NavLink to='/lyrics' className={linkClass}>
                    Lyrics
                  </NavLink>
                </div>

                <div className='relative'>
                  <NavLink to='/trends' className={linkClass}>
                    Trends
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
