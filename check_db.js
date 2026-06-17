const { neon } = require('@neondatabase/serverless');

async function checkDB() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        const count = await sql`SELECT COUNT(*) FROM sales`;
        console.log("Sales count:", count[0].count);

        const sample = await sql`SELECT * FROM sales LIMIT 5`;
        console.log("Sample:", sample);
    } catch(e) {
        console.error(e);
    }
}
checkDB();
