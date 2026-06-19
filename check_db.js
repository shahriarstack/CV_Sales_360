const { neon } = require('@neondatabase/serverless');

async function checkDB() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("--- Monthly breakdown of units by FY, sale_type, brand ---");
        const res = await sql`
            SELECT fy, sales_month, brand, sale_type, COUNT(*) as record_count, SUM(unit_qty) as total_units
            FROM sales
            GROUP BY fy, sales_month, brand, sale_type
            ORDER BY fy, 
              CASE sales_month
                WHEN 'July' THEN 1
                WHEN 'August' THEN 2
                WHEN 'September' THEN 3
                WHEN 'October' THEN 4
                WHEN 'November' THEN 5
                WHEN 'December' THEN 6
                WHEN 'January' THEN 7
                WHEN 'February' THEN 8
                WHEN 'March' THEN 9
                WHEN 'April' THEN 10
                WHEN 'May' THEN 11
                WHEN 'June' THEN 12
              END, brand, sale_type
        `;
        console.log(JSON.stringify(res, null, 2));

    } catch(e) {
        console.error(e);
    }
}
checkDB();

