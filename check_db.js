const { neon } = require('@neondatabase/serverless');

async function checkDB() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        const counts = await sql`SELECT fy, COUNT(*) FROM sales GROUP BY fy`;
        console.log("Sales counts by FY:", counts);

    } catch(e) {
        console.error(e);
    }
}
checkDB();
