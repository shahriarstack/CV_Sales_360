const { neon } = require('@neondatabase/serverless');

async function checkTargets() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Targets by brand in 2025-26 ---");
        const res = await sql`
            SELECT brand, COUNT(*), SUM(target_qty) as units
            FROM targets
            WHERE fy = '2025-26'
            GROUP BY brand
        `;
        console.log(res);

        console.log("--- Projections by brand in 2025-26 ---");
        const res2 = await sql`
            SELECT brand, COUNT(*), SUM(projection_qty) as units
            FROM projections
            WHERE fy = '2025-26'
            GROUP BY brand
        `;
        console.log(res2);

    } catch (e) {
        console.error(e);
    }
}
checkTargets();
