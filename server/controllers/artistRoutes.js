const connection = require('../db');


// Route : top artists
const top_artists = async (req, res) => { 
  const { region, country, start_year, end_year, page = 1 } = req.query;
  const pageSize = 10; // Fixed page size
  const offset = (page - 1) * pageSize;

  let sql = `
    WITH top_songs_of_region_and_time AS (
    SELECT c.track_id, t.track_name, COUNT(DISTINCT c.date) AS num_weeks_charted,
        COUNT(*) FILTER (WHERE c.position = 1) AS num_one_count,
        MIN(c.position) AS peak_position
    FROM chart c
    JOIN track t ON t.track_id = c.track_id
    WHERE 1 = 1`
    if (region) {
        sql += ` AND c.region = '${region}'`;
    } else {
        sql += ` AND c.region = 'global'`;
    }

if (start_year && end_year) {
    sql += ` AND EXTRACT(YEAR FROM c.date) BETWEEN ${start_year} AND ${end_year}`;
} else if (start_year) {
    sql += ` AND EXTRACT(YEAR FROM c.date) >= ${start_year}`;
} else if (end_year) {
    sql += ` AND EXTRACT(YEAR FROM c.date) <= ${end_year}`;
}
    sql += ` GROUP BY c.track_id, t.track_name
),
artist_stats AS (
    SELECT
        a.artist_name,  a.artist_id, SUM(t.num_weeks_charted) AS num_weeks_artist_charted,
        SUM(t.num_one_count) AS artist_num_one_count, MIN(t.peak_position) AS artist_peak_position
    FROM top_songs_of_region_and_time t
    JOIN track_artist ta ON t.track_id = ta.track_id
    JOIN artist a ON a.artist_id = ta.artist_id
    GROUP BY a.artist_id, a.artist_name
),
top_song_per_artist AS (
    SELECT DISTINCT ON (a.artist_name)
        a.artist_name, a.artist_id,
        t.track_name AS top_song,
        t.num_weeks_charted AS song_weeks_charted,
        t.num_one_count AS song_num_one_count,
        t.peak_position AS song_peak_position
    FROM top_songs_of_region_and_time t
    JOIN track_artist ta ON t.track_id = ta.track_id
    JOIN artist a ON a.artist_id = ta.artist_id
    ORDER BY a.artist_name, t.num_one_count DESC, t.num_weeks_charted DESC, t.peak_position
)
SELECT
    as_stats.artist_name,
    as_stats.num_weeks_artist_charted,
    as_stats.artist_num_one_count,
    as_stats.artist_peak_position,
    ts.top_song,
    ts.song_weeks_charted,
    ts.song_num_one_count,
    ts.song_peak_position, 
    COUNT(*) OVER() AS total_count
FROM artist_stats as_stats
JOIN top_song_per_artist ts ON as_stats.artist_id = ts.artist_id
ORDER BY as_stats.artist_num_one_count DESC, as_stats.num_weeks_artist_charted DESC, as_stats.artist_peak_position
LIMIT ${pageSize} OFFSET ${offset};
  `;
  connection.query(sql, (err, result) => {
      if (err) {
          console.log(err);
          res.json({});
      } else {
        let totalCount = result.rows.length > 0 ? result.rows[0].total_count : 0;
        res.json({ 
            data: result.rows || [], 
            totalCount: totalCount 
        });
      }
  });

};

// explore artist based on user's previous search
const explore_artist = async (req, res) => {
let { artist_id } = req.query;    
  let sql = `
            WITH artist_charting_songs AS (
                SELECT t.track_id, t.track_name, ta.artist_id
                FROM track t
                JOIN ( SELECT track_id, artist_id
                    FROM track_artist
                    WHERE artist_id = '${artist_id}'
                ) ta ON t.track_id = ta.track_id
                JOIN chart c ON c.track_id = t.track_id
                WHERE c.region = 'global'
                GROUP BY t.track_id, t.track_name, ta.artist_id
            ),
            charting_stats AS (
                SELECT s.track_id, COUNT(DISTINCT c.date) AS num_weeks_charted,
                    COUNT(*) FILTER (WHERE c.position = 1) AS num_one_count,
                    MIN(c.position) AS peak_position
                FROM artist_charting_songs s
                JOIN chart c ON c.track_id = s.track_id
                WHERE c.region = 'global'
                GROUP BY s.track_id
                ORDER BY num_weeks_charted DESC, num_one_count DESC, peak_position
            ),
            artist_stats AS (
                SELECT
                    a.artist_id, SUM(c.num_weeks_charted) AS num_weeks_artist_charted,
                    SUM(c.num_one_count) AS artist_num_one_count, MIN(c.peak_position) AS artist_peak_position
                FROM artist_charting_songs a
                JOIN charting_stats c ON c.track_id = a.track_id
                GROUP BY a.artist_id
            ),
            top_1gram AS (
                SELECT n.ngram, ac.artist_id, SUM(n.count) AS freq
                FROM artist_charting_songs ac
                JOIN ngrams n ON n.track_id = ac.track_id
                WHERE n.ngram_type = '1-gram'
                GROUP BY n.ngram, ac.artist_id
                ORDER BY freq DESC
                LIMIT 3
            ),
            top_2gram AS (
                SELECT n.ngram, ac.artist_id, SUM(n.count) AS freq
                FROM artist_charting_songs ac
                JOIN ngrams n ON n.track_id = ac.track_id
                WHERE n.ngram_type = '2-gram'
                GROUP BY n.ngram, ac.artist_id
                ORDER BY freq DESC
                LIMIT 3
            ),
            top_3gram AS (
                SELECT n.ngram, ac.artist_id, SUM(n.count) AS freq
                FROM artist_charting_songs ac
                JOIN ngrams n ON n.track_id = ac.track_id
                WHERE n.ngram_type = '3-gram'
                GROUP BY n.ngram, ac.artist_id
                ORDER BY freq DESC
                LIMIT 3
            ),
            combined_ngrams AS (
                SELECT ngram, artist_id, freq
                FROM top_1gram
                UNION ALL
                SELECT ngram, artist_id, freq
                FROM top_2gram
                UNION ALL
                SELECT ngram, artist_id, freq
                FROM top_3gram
            ),
            aggregated_ngrams AS (
                SELECT artist_id,
                    array_agg(ngram ORDER BY freq DESC) AS all_ngrams
                FROM combined_ngrams
                GROUP BY artist_id
            )
            SELECT ac.track_name, an.all_ngrams, cs.num_weeks_charted, cs.num_one_count, cs.peak_position,
                art.artist_num_one_count, art.num_weeks_artist_charted, art.artist_peak_position
            FROM artist_charting_songs ac
            JOIN charting_stats cs ON cs.track_id = ac.track_id
            JOIN artist_stats art ON art.artist_id = ac.artist_id
            JOIN aggregated_ngrams an ON an.artist_id = ac.artist_id
            ORDER BY cs.num_weeks_charted DESC;
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



// Route : autocomplete
const autocomplete = async (req, res) => { 
  // Extract user input into the search bar
  const { query } = req.query; 
  if (query) {
      // Sanitize the input to prevent SQL injection
      const sanitizedQuery = query.replace(/'/g, "''"); // Escape single quotes

      // Retrieve all artists that matches user search
      const sql = `
        SELECT a.artist_name, a.artist_id
        FROM artist a
        JOIN track_artist ta ON ta.artist_id = a.artist_id
        JOIN ( SELECT DISTINCT track_id 
               FROM chart
        WHERE chart.region = 'global'
        ) ch ON ch.track_id = ta.track_id
        WHERE a.artist_name ILIKE '%${sanitizedQuery}%'
        GROUP BY a.artist_name, a.artist_id
        ORDER BY ABS(LENGTH(a.artist_name) - LENGTH('${sanitizedQuery}'))
        LIMIT 10;
      `;
      connection.query(sql, (err, results) => {
          if (err) {
              console.log(err);
              res.json({});
          } else {
              res.json(results.rows);
          }
      });
  }
};


module.exports = {
  top_artists, explore_artist, autocomplete
}
