const { neon } = require('@neondatabase/serverless');

async function testDB() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("Testing concurrent queries...");
        const [targets, projections, emi, sales, recovery_od] = await Promise.all([
            sql`SELECT COUNT(*) FROM targets`,
            sql`SELECT COUNT(*) FROM projections`,
            sql`SELECT COUNT(*) FROM emi`,
            sql`SELECT COUNT(*) FROM sales`,
            sql`SELECT COUNT(*) FROM recovery_od`
        ]);
        
        console.log("Success:", {
            targets: targets[0].count,
            projections: projections[0].count,
            emi: emi[0].count,
            sales: sales[0].count,
            recovery_od: recovery_od[0].count
        });

    } catch(e) {
        console.error("Error during concurrent queries:", e);
    }
}
testDB();
