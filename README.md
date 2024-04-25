**Before you begin, ensure you have the following installed:**  

Node.js and npm: Download and install Node.js
PostgreSQL: Download and install PostgreSQL
pgAdmin: Download and install pgAdmin

**Install Prisma CLI**  
First, install the Prisma CLI globally using npm:
npm install -g prisma

**Set up PostgreSQL Database**  
Create Database
Using either the PostgreSQL command line or pgAdmin, create a new PostgreSQL database:
createdb mydatabase

**Configure Database URL**  
In your Node.js project, create a .env file and specify the database connection URL:
DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"

**Follow the prompts to create a new Prisma schema file (schema.prisma) and generate Prisma Client.**    
In your schema.prisma file, define your Prisma models:

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id      Int      @id @default(autoincrement())
  email   String   @unique
  name    String?
  posts   Post[]
}

**Run Migrations**  
Generate and apply migrations to create your database schema:
npx prisma migrate save --name init
npx prisma migrate up --experimental

**Start Node.js Application**  
**Start your Node.js application and connect to PostgreSQL using Prisma Client:**  

npm install
npm start


**Access Database with pgAdmin**  
Launch pgAdmin and connect to your PostgreSQL database using the connection URL specified earlier. You can now use pgAdmin to manage your database, run queries, and perform administrative tasks.
# prisma-nodejs
