const { neon } = require('@neondatabase/serverless');

async function checkRecentDB() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("Checking recent sales records...");
        const res = await sql`SELECT id, customer_id, fy, sales_year, sales_month FROM sales ORDER BY id DESC LIMIT 10`;
        console.log("Recent records:", res);

    } catch(e) {
        console.error(e);
    }
}
checkRecentDB();
