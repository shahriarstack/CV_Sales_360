const { neon } = require('@neondatabase/serverless');

async function fixFY() {
    try {
        const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");
        
        console.log("Updating FY in sales table based on sales_year and sales_month...");
        const result = await sql`
            UPDATE sales 
            SET fy = 
              CASE 
                WHEN sales_month IN ('January', 'February', 'March', 'April', 'May', 'June') THEN 
                  (sales_year - 1)::text || '-' || RIGHT(sales_year::text, 2)
                ELSE 
                  sales_year::text || '-' || RIGHT((sales_year + 1)::text, 2)
              END
            WHERE sales_year IS NOT NULL AND sales_year > 2000;
        `;
        
        console.log("Successfully updated FY for existing rows.");
    } catch(e) {
        console.error("Error updating DB:", e);
    }
}
fixFY();
