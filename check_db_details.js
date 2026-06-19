const { neon } = require('@neondatabase/serverless');

async function checkDB() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Total sales sum by brand and sale_type in 2024-25 ---");
        const res = await sql`
            SELECT brand, sale_type, COUNT(*), SUM(unit_qty) as units
            FROM sales
            WHERE fy = '2024-25'
            GROUP BY brand, sale_type
        `;
        console.log(res);

        console.log("--- Check if there are customer_ids that appear multiple times in 2024-25 ---");
        const custDups = await sql`
            SELECT customer_id, COUNT(*) as count, SUM(unit_qty) as units
            FROM sales
            WHERE fy = '2024-25'
            GROUP BY customer_id
            HAVING COUNT(*) > 1
            ORDER BY count DESC
            LIMIT 10
        `;
        console.log("Duplicate customer_ids in 2024-25:", custDups);

    } catch (e) {
        console.error(e);
    }
}
checkDB();
