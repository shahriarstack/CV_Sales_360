import { neon } from "npm:@neondatabase/serverless";

const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function main() {
    try {
        console.log("Creating app_settings table if it doesn't exist...");
        await sql`
            CREATE TABLE IF NOT EXISTS app_settings (
                id VARCHAR(50) PRIMARY KEY,
                settings_json JSONB NOT NULL
            );
        `;
        
        console.log("Seeding default settings...");
        await sql`
            INSERT INTO app_settings (id, settings_json) 
            VALUES ('1', '{"currentMonth": "April", "lastMonth": "March"}')
            ON CONFLICT (id) DO NOTHING;
        `;
        console.log("app_settings table setup complete!");
    } catch (e) {
        console.error("Error setting up app_settings:", e);
    }
}

main();
