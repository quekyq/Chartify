const connection = require('../db');

const top_lyrics = async (req, res) => {
  const { ngram_type, explicit, region, start_year, end_year, page = 1 } = req.query;
  const pageSize = 12; // Fixed page size
  const offset = (page - 1) * pageSize;
  let sql = 
       ` WITH top_songs_of_region_and_time AS (
          SELECT c.track_id, t.track_name
          FROM chart c
          JOIN track t ON t.track_id = c.track_id
          WHERE t.explicit = ${explicit === 'true'} `;

        if (region) {
            sql += ` AND c.region = '${region}'`;
        } else {
            sql += ` AND c.region = 'global'`;
        }
        
        if (start_year && end_year) {
            sql += ` AND c.date BETWEEN '${start_year}-01-01' AND '${end_year}-12-31'`;
        } else if (start_year) {
            sql += ` AND c.date >= '${start_year}-01-01'`;
        } else if (end_year) {
            sql += ` AND c.date <= '${end_year}-12-31'`;
        }
            sql += ` GROUP BY t.track_name, c.track_id
      ),
      top_ngrams AS (
            SELECT
                n.ngram,
                SUM(n.count) AS frequency
            FROM ngrams n
            JOIN top_songs_of_region_and_time t ON t.track_id = n.track_id
            WHERE n.ngram_type = '${ngram_type}'
            GROUP BY n.ngram
            ORDER BY frequency DESC, ngram
            LIMIT 30
        ),
      top_ngram_songs AS (
          SELECT  
              n.ngram,
              l.lyrics,
              n.track_id,
              t.track_name,
              n.count AS ngram_count,
              RANK() OVER (PARTITION BY n.ngram ORDER BY n.count DESC, n.track_id) AS rank
          FROM ngrams n
            JOIN top_ngrams tn ON tn.ngram = n.ngram
            JOIN lyrics l ON n.track_id = l.track_id
            JOIN top_songs_of_region_and_time t ON t.track_id = n.track_id
      ),
      ngram_song_counts AS (
          SELECT
              ngram,
              COUNT(DISTINCT track_id) AS song_count
          FROM top_ngram_songs
          GROUP BY ngram
          HAVING COUNT(DISTINCT track_id) >= 3 
      )
      SELECT
          tng.ngram,
          tng.frequency,
          ARRAY_AGG(ts.lyrics ORDER BY ts.rank) AS lyrics,
          ARRAY_AGG(ts.track_name ORDER BY ts.rank) AS track_name,
          ARRAY_AGG(ta.artists ORDER BY ts.rank) AS artists,
          COUNT(*) OVER() AS total_count
      FROM top_ngram_songs ts
      JOIN top_ngrams tng ON ts.ngram = tng.ngram
      JOIN track_all_artists ta ON ta.track_id = ts.track_id
      JOIN ngram_song_counts nc ON nc.ngram = ts.ngram
      WHERE ts.rank <= 3
      GROUP BY tng.ngram, tng.frequency
      ORDER BY tng.frequency DESC, tng.ngram
      LIMIT ${pageSize} OFFSET ${offset}; `;

  connection.query(sql, (err, result)=> {
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
}


const explore_lyrics = async (req, res) => {
  const { ngram } = req.query;
  const sanitizedNgram = ngram.replace(/'/g, "''");
  if (ngram) {
    let sql = `
      SELECT ta.track_name, lyrics, ta.artists, n.count
      FROM ngrams n
      JOIN lyrics l ON l.track_id = n.track_id
      JOIN track_all_artists ta ON ta.track_id = n.track_id
      WHERE n.ngram = '${sanitizedNgram}'
      ORDER BY n.count DESC
      LIMIT 50`;
    connection.query(sql, (err, data)=> {
        if (err) {
            console.log(err);
            res.json({});
        } else {
            res.json(data.rows);
        }
    }); 

  }
  
}

const autocomplete = async (req, res) => {
  const { query } = req.query; 
  if (query) {
      // Sanitize the input to prevent SQL injection
      const sanitizedQuery = query.replace(/'/g, "''"); // Escape single quotes

      // Retrieve all artists that matches user search
      const sql = `
            SELECT n.ngram
            FROM ngrams_mv n
            WHERE n.ngram ILIKE '%${sanitizedQuery}%'
            ORDER BY ABS(LENGTH(n.ngram) - LENGTH('%${sanitizedQuery}%'))
            LIMIT 15; 
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
}

module.exports = {
  top_lyrics, explore_lyrics, autocomplete
  }
