const { neon } = require('@neondatabase/serverless');

async function checkBrands() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Total sales sum by brand and sale_type in 2025-26 ---");
        const res = await sql`
            SELECT brand, sale_type, COUNT(*), SUM(unit_qty) as units
            FROM sales
            WHERE fy = '2025-26'
            GROUP BY brand, sale_type
        `;
        console.log(res);

    } catch (e) {
        console.error(e);
    }
}
checkBrands();
