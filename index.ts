//   // await prisma.user.create({
//   //   data: {
//   //     name: 'Alice',
//   //     email: 'alice@prisma3.io',
//   //     posts: {
//   //       create: { title: 'Hello World' },
//   //     },
//   //     profile: {
//   //       create: { bio: 'I like turtles' },
//   //     },
//   //   },
//   // })

//   const allUsers = await prisma.user.findMany({
//     include: {
//       posts: true,
//       profile: true,
//     },
//   })
//   console.dir(allUsers, { depth: null })
//   const post = await prisma.post.update({
//     where: { id: 1 },
//     data: { published: true },
//   })
//   console.log(post)
//   // const deletedItem = await prisma.$transaction([
//   //   prisma.post.deleteMany({
//   //     where: {
//   //       authorId: 6, // Replace with the actual user ID you want to delete
//   //     },
//   //   }),
//   //   prisma.profile.delete({
//   //     where: {
//   //       userId: 6, // Replace with the actual user ID you want to delete
//   //     },
//   //   }),
//   //   prisma.user.delete({
//   //     where: {
//   //       id: 6, // Replace with the actual user ID you want to delete
//   //     },
//   //   }),
//   // ]);
//   // console.log(deletedItem)
// }
import express, {Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()
const app = express();
const port = 3000;
async function main(){
    // Middleware to parse JSON bodies
    app.use(bodyParser.json());

    // Signup endpoint
    app.post('/signup', async (req, res) => {
        try{
            const { email, password, name} = req.body;
            console.log({email, password, name})
            // Check if email is already registered
            const existingUser = await prisma.admin.findUnique({ where: { email } });
            if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
            }
        
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
        
            // Create new user
            const newUser = await prisma.admin.create({
            data: {
                email,
                password: hashedPassword,
                name
            },
            });
        
            res.json({ message: 'User created successfully', Admin: newUser });
        }
        catch(error){
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
    
      // Validate user credentials
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin || !bcrypt.compareSync(password, admin.password)) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    
      // Generate JWT
      const token = jwt.sign({ userId: admin.id }, 'your_secret_key', { expiresIn: '1h' });
      res.json({ token });
    });

    // Authorization middleware
    function authenticateToken(req: any, res: Response, next: NextFunction) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token == null) return res.sendStatus(401);
      jwt.verify(token, 'your_secret_key', (err:any, user:any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    }

    // Protected route
    app.get('/profile', authenticateToken, async (req:any, res: Response) => {
      const userId = req?.user?.userId;
      const user = await prisma.admin.findUnique({ where: { id: userId } });
      res.json(user);
    });

    // Start the server
    app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    });

    async function cleanup() {
    await prisma.$disconnect();
    }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    // process.exit(1)
  })

