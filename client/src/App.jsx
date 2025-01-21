import {
  Route, 
  createBrowserRouter, 
  createRoutesFromElements, 
  RouterProvider
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import SongPage from './pages/SongPage/index';
import ArtistPage from './pages/ArtistPage/index';
import AlbumPage from './pages/AlbumPage/index';
import LyricsPage from './pages/LyricsPage/index';
import TrendsPage from './pages/TrendsPage/index';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path = '/' element = {<MainLayout/>}>,    
      <Route index element = {<HomePage/>} />,
      <Route path = '/song' element = {<SongPage/>} />
      <Route path = '/artist' element = {<ArtistPage/>} />
      <Route path = '/album' element = {<AlbumPage/>} />
      <Route path = '/lyrics' element = {<LyricsPage/>} />
      <Route path = '/trends' element = {<TrendsPage/>} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App

