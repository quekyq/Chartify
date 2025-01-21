const connection = require('../db');
const { getISOWeek } = require('date-fns'); //for converting date to week number

  
/********************************
 * HOME PAGE ROUTES *
 ********************************/
// Route 1: GET /topOfTheWeek
  const top_song_of_the_week = async (req, res) => {
    // find the week number of the current date
    const curr_week_num = getISOWeek(new Date()); 

    connection.query(`
        SELECT t.track_name,
            STRING_AGG(a.artist_name, ', ') AS artists,
            al.album_title AS album, EXTRACT(YEAR FROM c.date) AS year
        FROM chart c
        JOIN track t ON t.track_id = c.track_id
        JOIN track_artist ta ON t.track_id = ta.track_id
        JOIN artist a ON ta.artist_id = a.artist_id
        JOIN album al ON t.album_id = al.album_id
        WHERE EXTRACT(WEEK FROM c.date) = ${curr_week_num}
            AND c.position = 1
            AND c.region = 'global'
        GROUP BY t.track_name, al.album_title, EXTRACT(YEAR FROM c.date)
        ORDER BY RANDOM()
        LIMIT 1;                                 
        `, (err, data)=> {
        if (err) {
            console.log(err);
            res.json({});
        } else {
            res.json(data.rows[0]);
        }
    }); 
  }

/********************************
 * SONG PAGE ROUTES *
 ********************************/
// Route 2: GET /song/top

const top_song = async (req, res) => {
    let { region, country, start_year, end_year, page = 1 } = req.query;
    
    const pageSize = 10; // Fixed page size
    const offset = (page - 1) * pageSize;
    
    let sql = ` WITH top_songs_stats AS (
                    SELECT t.track_id,
                        COUNT(c.date) AS num_weeks_charted,
                        COUNT(*) FILTER (WHERE c.position = 1) AS num_one_count,
                        MIN(c.position) AS peak_position
                    FROM chart c
                    JOIN track t ON t.track_id = c.track_id
                    WHERE 1 = 1 
                    `;
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

    sql += ` GROUP BY t.track_id) `;

    sql += `SELECT ta.track_name, ta.artists, ta.album_title, 
                ts.num_one_count, ts.num_weeks_charted, ts.peak_position,
                COUNT(*) OVER() AS total_count
            FROM top_songs_stats ts
            JOIN track_artists_album ta ON ts.track_id = ta.track_id
            ORDER BY ts.num_one_count DESC, ts.num_weeks_charted DESC, ts.peak_position
            LIMIT ${pageSize} OFFSET ${offset}`;

    connection.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            res.json({ data: [], totalCount: 0 });
        } else {
            let totalCount = result.rows.length > 0 ? result.rows[0].total_count : 0;
            res.json({ 
                data: result.rows || [], 
                totalCount: totalCount 
            });
        }
    });
};

  // Route 5: explore song
  const explore_song = async (req, res) => {
    let { track_id, region, country, start_year, end_year, page = 1 } = req.query;
    if (track_id) {
        let sql = `
                SELECT
                    t.track_name, t.track_id,
                    a.artists,
                    ta.num_weeks_charted,
                    ta.num_one_count,
                    ta.peak_position,
                    ta.date, ta.position,
                    t.explicit,
                    t.danceability,
                    t.energy,
                    t.key,
                    t.loudness,
                    t.mode,
                    t.speechiness,
                    t.acousticness,
                    t.instrumentalness,
                    t.liveness,
                    t.valence,
                    t.tempo,
                    t.duration_ms,
                    t.time_signature
                FROM (
                    SELECT
                        c.track_id,
                        COUNT(c.date) AS num_weeks_charted,
                        COUNT(*) FILTER (WHERE c.position = 1) AS num_one_count,
                        MIN(c.position) AS peak_position,
                        array_agg(c.date ORDER BY c.date) AS date,
                        array_agg(c.position ORDER BY c.date) AS position
                    FROM chart c
                    WHERE c.track_id = '${track_id}'`;
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
        
            sql+= `GROUP BY c.track_id
                ) AS ta
                JOIN track t ON t.track_id = ta.track_id
                JOIN track_all_artists a ON a.track_id = ta.track_id;  
                `;

        connection.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                res.json({});
            } else {
                res.json(data.rows);
            }
        });
        

    }
    
   
  }
// Top genres
const top_genres = async (req, res) => {
    let { region, country, start_year, end_year} = req.query;    
    let sql = `WITH filteredSongsByYear AS (
    SELECT
        t.track_id,
        gm.grouped_genre,
        t.track_name,
        COUNT(c.date) AS weeks_charted,
        COUNT(*) FILTER (WHERE c.position = 1) AS num_one_count,
        MIN(c.position) AS peak_position
    FROM chart c
    JOIN track t ON t.track_id = c.track_id
    JOIN genre_mapping_mv gm ON gm.track_id = t.track_id
    WHERE 1 = 1 `;
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
    
    sql += ` GROUP BY t.track_id, t.track_name, gm.grouped_genre
            ),
            genre_stats AS (
                SELECT fs.grouped_genre,
                    SUM(fs.weeks_charted) AS genre_weeks_charted,
                    SUM(fs.num_one_count) AS genre_num_one_count
                FROM filteredSongsByYear fs
                GROUP BY fs.grouped_genre
            ),
            ranked_tracks AS (
                SELECT *,
                    ROW_NUMBER() OVER (
                        PARTITION BY fs.grouped_genre
                        ORDER BY fs.peak_position, fs.weeks_charted DESC
                    ) AS rank
                FROM filteredSongsByYear fs
            )
            SELECT
                gs.grouped_genre,
                gs.genre_weeks_charted,
                gs.genre_num_one_count,
                rt.track_name AS top_track_name,
                rt.peak_position AS top_track_peak_position,
                rt.weeks_charted AS top_track_weeks_charted
            FROM genre_stats gs
            JOIN ranked_tracks rt ON gs.grouped_genre = rt.grouped_genre AND rt.rank = 1
            WHERE genre_weeks_charted > 9
            ORDER BY gs.genre_weeks_charted DESC, gs.grouped_genre
            LIMIT 20;
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

  // Route 4: autocomplete
  const autocomplete = async (req, res) => { 
    // Extract user input into the search bar
    const { query } = req.query; 
    if (query) {
        // Sanitize the input to prevent SQL injection
        const sanitizedQuery = query.replace(/'/g, "''"); // Escape single quotes

        // Retrieve all track name and their release year that matches user search
        const sql = `
            SELECT ta.track_name, ta.artists, ta.track_id
            FROM track_all_artists ta
            JOIN ( SELECT DISTINCT c.track_id FROM chart c WHERE c.region = 'global' 
             ) ch ON ch.track_id = ta.track_id
            WHERE ta.track_name ILIKE '%${sanitizedQuery}%'
            GROUP BY ta.track_name, ta.artists, ta.track_id
            ORDER BY ABS(LENGTH(ta.track_name) - LENGTH('${sanitizedQuery}'))
            LIMIT 10;
        `;

        connection.query(sql, (err, results) => {
            if (err) {
                console.log(err);
                res.json({});
            } else {
                // const titles = results.rows.map(row => `${row.track_name}, ${row.artists}, ${row.track_id}`);
                res.json(results.rows);
            }
        });
    }
};



  module.exports = {
    top_song_of_the_week, top_song, autocomplete, explore_song, top_genres
  }

