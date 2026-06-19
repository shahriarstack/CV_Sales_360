const { neon } = require('@neondatabase/serverless');

async function checkTerritories() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Sales count by territory_id in 2024-25 ---");
        const salesByTerr = await sql`
            SELECT s.territory_id, t.name, COUNT(*), SUM(s.unit_qty) as total_units
            FROM sales s
            LEFT JOIN territories t ON s.territory_id = t.id
            WHERE s.fy = '2024-25'
            GROUP BY s.territory_id, t.name
            ORDER BY total_units DESC
        `;
        console.log(salesByTerr);

    } catch (e) {
        console.error(e);
    }
}
checkTerritories();
