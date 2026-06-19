const { neon } = require('@neondatabase/serverless');

async function checkDetails() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Check duplicate-like rows in sales (identical fields but different ids) ---");
        const dupCandidates = await sql`
            SELECT customer_id, district, territory_id, upazila, brand, model, unit_qty, fy, sales_year, sales_month, sale_type, COUNT(*) as count
            FROM sales
            GROUP BY customer_id, district, territory_id, upazila, brand, model, unit_qty, fy, sales_year, sales_month, sale_type
            HAVING COUNT(*) > 1
            ORDER BY count DESC
            LIMIT 50
        `;
        console.log("Duplicate candidates (identical rows):", dupCandidates);

        const fyCounts = await sql`SELECT fy, COUNT(*), SUM(unit_qty) as total_units FROM sales GROUP BY fy`;
        console.log("Counts by FY:", fyCounts);

    } catch (e) {
        console.error(e);
    }
}
checkDetails();
