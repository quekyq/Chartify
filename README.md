# Chartify

Chartify is an interactive web application offering music trend analytics and insights into a decade of music streaming history. It leverages data from Spotify Charts, Spotify Tracks, and lyrics retrieved via the LRCLIB API to help users explore music trends over time.

The application features a user-friendly interface with interactive data visualizations, allowing users to uncover patterns in charting success, compare genres, analyze lyrical themes, and explore how song attributes like danceability or energy have changed over the years.

## Features
- **Home Page**: Displays a randomly selected top global song from streaming history, offering a fresh discovery experience with each visit.
- **Top Songs**: Ranked tables of chart-topping songs, filterable by region and time period.
- **Top Genres**: Bar charts showcasing the chart performance of music genres, highlighting their defining tracks.
- **Explore Songs**: Searchable database of songs with detailed charting history, artist information, and song attributes.
- **Top Artists**: Rankings of artists by total weeks at #1 and overall chart performance, with filtering options.
- **Explore Artists**: Search for an artist to view their chart history, frequent lyric phrases, and top tracks.
- **Top Albums & Explore Albums**: View rankings of top albums globally or search for a specific album to explore its chart performance and song details.
- **Lyrics Analysis**: Examine the most common lyric phrases, filterable by region, time, and explicit content. Explore lyrics by searching for specific phrases in songs.
- **Trends**: Analyze the evolution of song attributes like danceability and tempo over time, or explore correlations between different attributes using scatter plots.

---

### Getting Started:
##### 1. Clone this repository
```
git clone <this-repo's-url>
cd <repo-folder>
```

##### 2. Set Up the client

Navigate to the `client` directory:
```
cd client
```
Install dependencies and start the development server:
```
npm install
npm run dev
```

##### 3. Set up the Server
Navigate to the `server` directory:

```
cd ../server
```
Install dependencies and start the server:
```
npm install
npm start
```

---
### Technologies Used
Frontend: Vite, React.js, Tailwind CSS, Shadcn UI
Backend: Node.js, Express.js
Database: PostgreSQL
APIs: LRCLIB API, Spotify API

### Acknowledgements
Data is sourced from Kaggle, Spotify and LRCLIB.


