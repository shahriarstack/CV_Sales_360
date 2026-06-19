const { neon } = require('@neondatabase/serverless');

async function checkMahindra() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Mahindra New Sale records in 2024-25 ---");
        const res = await sql`
            SELECT * FROM sales
            WHERE fy = '2024-25' AND brand = 'Mahindra' AND sale_type = 'New Sale'
        `;
        console.log(res);

    } catch (e) {
        console.error(e);
    }
}
checkMahindra();
