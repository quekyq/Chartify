const connection = require('../db');

/********************************
 * AlBUM PAGE ROUTES *
 ********************************/

// Route: GET /albums/top
const top_albums = async (req, res) => {
    const { region, start_year, end_year, page = 1 } = req.query;
    const pageSize = 10; // Fixed page size
    const offset = (page - 1) * pageSize;

    let sql = `WITH filtered_chart AS (
            SELECT c.track_id, c.position, c.date
            FROM chart c
            WHERE 1 = 1 `
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
       sql += ` ), album_stats AS (
            SELECT
                t.album_id,
                al.album_title,
                COUNT(ch.date) AS num_weeks_charted,
                COUNT(*) FILTER (WHERE ch.position = 1) AS num_one_count,
                MIN(ch.position) AS peak_position
            FROM filtered_chart ch
            JOIN track t ON t.track_id = ch.track_id
            JOIN album al ON t.album_id = al.album_id
            GROUP BY t.album_id, al.album_title
        )
        SELECT
            als.album_title,
            aa.artists,
            als.num_weeks_charted,
            als.num_one_count,
            als.peak_position,
            COUNT(*) OVER() AS total_count
        FROM album_stats als
        JOIN album_all_artist aa ON als.album_id = aa.album_id
        ORDER BY als.num_one_count DESC, als.num_weeks_charted DESC, als.peak_position
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
  }

  const explore_album = async (req, res) => {
    const { album_id } = req.query;   
    let sql = `
            WITH song_that_charted_in_this_album AS (
            SELECT t.track_name, COUNT(c.date) AS num_weeks_charted,
                    COUNT(*) FILTER (WHERE c.position = 1) AS num_one_count,
                    MIN(c.position) AS peak_position, t.album_id, al.album_title
            FROM track t
            JOIN album al ON t.album_id = al.album_id
            JOIN chart c ON c.track_id = t.track_id
            WHERE al.album_id = '${album_id}'
            AND c.region = 'global'
            GROUP BY t.track_name, t.track_id, al.album_title
        ),
        album_stats AS (
            SELECT s.album_id, s.album_title,
                SUM(s.num_weeks_charted) AS total_weeks_charted,
                sum(s.num_one_count) AS total_one_count,
                MIN(s.peak_position) AS min_peak_position
            FROM song_that_charted_in_this_album s
            GROUP BY s.album_id, s.album_id, s.album_title
        )
        SELECT
            als.album_title,
            aa.artists,
            als.total_weeks_charted,
            als.total_one_count,
            als.min_peak_position, ARRAY_AGG(s.track_name) as charting_songs
        FROM album_stats als
        JOIN album_all_artist aa ON als.album_id = aa.album_id
        JOIN song_that_charted_in_this_album s ON s.album_id = als.album_id
        GROUP BY als.album_title, aa.artists, als.total_weeks_charted, als.total_one_count, als.min_peak_position
        ORDER BY als.total_one_count DESC, als.total_weeks_charted DESC, als.min_peak_position;
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

  const autocomplete = async (req, res) => {
    const { query } = req.query; 
    if (query) {
        // Sanitize the input to prevent SQL injection
        const sanitizedQuery = query.replace(/'/g, "''"); // Escape single quotes

        // Retrieve all artists that matches user search
        const sql = `
            SELECT ab.album_title, ab.album_id, aa.artists
            FROM album ab
            JOIN track t ON t.album_id = ab.album_id
            JOIN chart c ON c.track_id = t.track_id
            JOIN album_all_artist aa ON aa.album_id = ab.album_id
            WHERE c.region = 'global'
            AND ab.album_title ILIKE '%${sanitizedQuery}%'
            GROUP BY ab.album_title, ab.album_id, aa.artists
            ORDER BY ABS(LENGTH(ab.album_title) - LENGTH('${sanitizedQuery}'))
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
  }

  module.exports = {
    top_albums, explore_album, autocomplete
  }
