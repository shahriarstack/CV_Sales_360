const { neon } = require('@neondatabase/serverless');

async function dedupDB() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("Removing duplicate sales records...");
        const res = await sql`
            DELETE FROM sales 
            WHERE id IN (
                SELECT id
                FROM (
                    SELECT id, ROW_NUMBER() OVER( PARTITION BY customer_id, model, sales_month, sales_year ORDER BY id DESC ) as row_num
                    FROM sales
                ) t
                WHERE t.row_num > 1
            );
        `;
        
        console.log("Deleted duplicate rows.");
        
        const counts = await sql`SELECT fy, COUNT(*) FROM sales GROUP BY fy`;
        console.log("New Sales counts by FY:", counts);

    } catch(e) {
        console.error(e);
    }
}
dedupDB();
