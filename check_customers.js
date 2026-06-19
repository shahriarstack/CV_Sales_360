const { neon } = require('@neondatabase/serverless');

async function checkCustomers() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Check customer_id formats in 2024-25 sales ---");
        const sample1 = await sql`
            SELECT customer_id, count(*)
            FROM sales
            WHERE fy = '2024-25'
            GROUP BY customer_id
            ORDER BY count(*) DESC
            LIMIT 20
        `;
        console.log("Sample customer_id counts in 2024-25:", sample1);

        console.log("--- Check sample rows in 2024-25 sales ---");
        const sampleRows = await sql`
            SELECT id, customer_id, district, territory_id, upazila, brand, model, unit_qty, sales_year, sales_month, sale_type
            FROM sales
            WHERE fy = '2024-25'
            LIMIT 10
        `;
        console.log("Sample rows in 2024-25:", sampleRows);

    } catch (e) {
        console.error(e);
    }
}
checkCustomers();
