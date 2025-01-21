const express = require("express");
const config = require('./config');
const cors = require("cors");

const songRoutes = require('./controllers/songRoutes');
const artistRoutes = require('./controllers/artistRoutes');
const albumRoutes = require('./controllers/albumRoutes');
const lyricRoutes = require('./controllers/lyricRoutes');
const trendRoutes = require('./controllers/trendRoutes');


const app = express();
const corsOptions = {
  origin: '*',
};

app.use(cors(corsOptions));
// home page
app.get('/topSongOfWeek', songRoutes.top_song_of_the_week);
// song page
app.get('/song/top', songRoutes.top_song);
app.get('/song/search', songRoutes.autocomplete);
app.get('/song/explore', songRoutes.explore_song);
app.get('/song/genres', songRoutes.top_genres);
// artist page
app.get('/artist/top', artistRoutes.top_artists);
app.get('/artist/search', artistRoutes.autocomplete);
app.get('/artist/explore', artistRoutes.explore_artist);
// album page
app.get('/album/top', albumRoutes.top_albums);
app.get('/album/search', albumRoutes.autocomplete);
app.get('/album/explore', albumRoutes.explore_album);
// lyrics page
app.get('/lyrics/top', lyricRoutes.top_lyrics);
app.get('/lyrics/search', lyricRoutes.autocomplete);
app.get('/lyrics/explore', lyricRoutes.explore_lyrics);
// trends page
app.get('/trends/song-evolution', trendRoutes.song_evolution);
app.get('/trends/attribute-correlation', trendRoutes.attrib_correlation);

app.listen(8080, () => {
  console.log("Server started on port 8080");
});

module.exports = app;