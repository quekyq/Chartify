const connection = require('../db');

const song_evolution = async (req, res) => {
    let sql = `
    WITH charting_songs_with_genres AS (
    SELECT
        gm.grouped_genre,
        EXTRACT(YEAR FROM c.date) AS year,
        AVG(CASE WHEN t.explicit THEN 1 ELSE 0 END) * 100 AS percent_explicit,
        AVG(t.danceability) AS avg_danceability,
        AVG(t.energy) AS avg_energy,
        AVG(t.loudness) AS avg_loudness,
        AVG(t.speechiness) AS avg_speechiness,
        AVG(t.acousticness) AS avg_acousticness,
        AVG(t.instrumentalness) AS avg_instrumentalness,
        AVG(t.liveness) AS avg_liveness,
        AVG(t.valence) AS avg_valence,
        AVG(t.tempo) AS avg_tempo,
        AVG(t.duration_ms / 1000) AS avg_duration
    FROM chart c
    JOIN genre_mapping_mv gm ON gm.track_id = c.track_id
    JOIN track t ON t.track_id = c.track_id
    GROUP BY grouped_genre, year
),
filtered_genres AS (
    SELECT grouped_genre
    FROM charting_songs_with_genres
    GROUP BY grouped_genre
    HAVING COUNT(DISTINCT year) > 9
),
base_metrics AS (

    SELECT
        'overall' AS grouped_genre,
        EXTRACT(YEAR FROM c.date) AS year,
        AVG(CASE WHEN t.explicit THEN 1 ELSE 0 END) * 100 AS percent_explicit,
        AVG(t.danceability) AS avg_danceability,
        AVG(t.energy) AS avg_energy,
        AVG(t.loudness) AS avg_loudness,
        AVG(t.speechiness) AS avg_speechiness,
        AVG(t.acousticness) AS avg_acousticness,
        AVG(t.instrumentalness) AS avg_instrumentalness,
        AVG(t.liveness) AS avg_liveness,
        AVG(t.valence) AS avg_valence,
        AVG(t.tempo) AS avg_tempo,
        AVG(t.duration_ms / 1000) AS avg_duration
    FROM chart c
    JOIN track t ON t.track_id = c.track_id
    GROUP BY EXTRACT(YEAR FROM c.date)
    UNION ALL

    SELECT *
    FROM charting_songs_with_genres cg
    WHERE cg.grouped_genre IN (SELECT grouped_genre FROM filtered_genres)
)
SELECT  b.grouped_genre, ARRAY_AGG(b.year),
        ARRAY_AGG(b.percent_explicit ORDER BY year) AS explicit,
        ARRAY_AGG(b.avg_danceability ORDER BY year) AS danceability,
        ARRAY_AGG(b.avg_energy ORDER BY year) AS energy,
        ARRAY_AGG(b.avg_loudness ORDER BY year) AS loudness,
        ARRAY_AGG(b.avg_speechiness ORDER BY year) AS speechiness,
        ARRAY_AGG(b.avg_acousticness ORDER BY year) AS acousticness,
        ARRAY_AGG(b.avg_instrumentalness ORDER BY year) AS instrumentalness,
        ARRAY_AGG(b.avg_liveness ORDER BY year) AS liveness,
        ARRAY_AGG(b.avg_valence ORDER BY year) AS valence,
        ARRAY_AGG(b.avg_tempo ORDER BY year) AS tempo,
        ARRAY_AGG(b.avg_duration ORDER BY year) AS duration
FROM base_metrics b
GROUP BY b.grouped_genre;
    `;
    connection.query(sql, (err, data)=> {
        if (err) {
            console.log(err);
            res.json({});
        } else {
            res.json(data.rows);
        }
    }); 
  }

  const attrib_correlation = async (req, res) => {
    
        
        let sql = `
        WITH random_tracks AS (
          SELECT *
          FROM track
          WHERE random() < 0.1  
        )
        SELECT 
          t.danceability, 
          t.energy, 
          t.loudness, 
          t.speechiness, 
          t.acousticness, 
          t.instrumentalness, 
          t.liveness, 
          t.valence, 
          t.tempo, 
          t.duration_ms
        FROM random_tracks t
        LIMIT 1000; 
        `;

        connection.query(sql, (err, data) => {
        if (err) {
            console.error('Query error:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(data.rows);
        }
        }); 

  }

  const lyrics_evolution = async (req, res) => {
    let sql = ``
    connection.query(sql, (err, data)=> {
        if (err) {
            console.log(err);
            res.json({});
        } else {
            res.json(data.rows);
        }
    }); 
  }

module.exports = {
    song_evolution, attrib_correlation, lyrics_evolution
  }
