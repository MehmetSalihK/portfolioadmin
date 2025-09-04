import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not defined');
}

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            throw new Error('Veuillez fournir un email et un mot de passe');
          }

          await connectDB();
          console.log('Connected to database');
          console.log('Attempting login for:', credentials.email);
          
          // Vérifier si c'est une authentification 2FA déjà vérifiée
          if (credentials.password === 'verified-2fa') {
            console.log('2FA already verified, creating session...');
            
            // Vérifier si c'est l'admin par défaut
            if (credentials.email === process.env.ADMIN_EMAIL) {
              return {
                id: 'default-admin',
                email: process.env.ADMIN_EMAIL,
                name: 'Admin',
                role: 'admin',
              };
            }
            
            // Chercher l'admin dans la base de données
            const admin = await Admin.findOne({ email: credentials.email });
            if (!admin) {
              throw new Error('Utilisateur non trouvé');
            }
            
            // Mettre à jour la dernière connexion
            await Admin.findByIdAndUpdate(admin._id, {
              lastLogin: new Date(),
            });
            
            return {
              id: admin._id.toString(),
              email: admin.email,
              name: admin.name,
              role: admin.role,
            };
          }
          
          // Authentification normale (ne devrait plus être utilisée avec 2FA)
          // Vérifier si c'est l'admin par défaut
          if (credentials.email === process.env.ADMIN_EMAIL && 
              credentials.password === process.env.ADMIN_PASSWORD) {
            console.log('Using default admin credentials');
            return {
              id: 'default-admin',
              email: process.env.ADMIN_EMAIL,
              name: 'Admin',
              role: 'admin',
            };
          }

          const admin = await Admin.findOne({ email: credentials.email }).select('+password');
          
          if (!admin) {
            console.error('Admin not found:', credentials.email);
            throw new Error('Email ou mot de passe invalide');
          }

          const isPasswordValid = await admin.comparePassword(credentials.password);
          
          if (!isPasswordValid) {
            console.error('Invalid password for:', credentials.email);
            throw new Error('Email ou mot de passe invalide');
          }

          console.log('Login successful for:', credentials.email);

          // Update last login
          await Admin.findByIdAndUpdate(admin._id, {
            lastLogin: new Date(),
          });

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
