import { neon } from "npm:@neondatabase/serverless";

const sql = neon("postgresql://neondb_owner:npg_5XUZLavKxk9T@ep-solitary-resonance-aoh7grwd-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function main() {
    try {
        console.log("Updating users table schema...");
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100)`;
        
        // Map any existing users based on their mock data id
        await sql`UPDATE users SET employee_id = 'ADMIN001' WHERE id = 'u1'`;
        await sql`UPDATE users SET employee_id = 'AM001' WHERE id = 'u2'`;
        await sql`UPDATE users SET employee_id = 'SO001' WHERE id = 'u3'`;
        await sql`UPDATE users SET employee_id = 'SO002' WHERE id = 'u4'`;
        
        console.log("Users schema updated successfully!");
    } catch (e) {
        console.error("Error updating users:", e);
    }
}

main();
