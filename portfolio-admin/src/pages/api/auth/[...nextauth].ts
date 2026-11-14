import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { loginSchema } from '@/utils/schemas';
import { readCookieHeader, verifyTwoFaProof, TWOFA_COOKIE_NAME } from '@/lib/two-fa';

/**
 * Jeton de passage utilisé par la page de vérification 2FA.
 * Ce n'est PAS un secret : il ne sert que de signal « l'étape 1 a été
 * validée ». L'authentification réelle est la preuve 2FA signée par le
 * serveur (cookie HttpOnly) vérifiée ci-dessous. Le mot de passe réel n'est
 * JAMAIS accepté ici, sinon la 2FA serait contournable en appelant
 * directement l'endpoint credentials.
 */
const TWOFA_PASSAGE_TOKEN = 'verified-2fa';

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
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            throw new Error('Veuillez fournir un email et un mot de passe');
          }

          // Valider les entrées avec Zod
          const result = loginSchema.safeParse({
            email: credentials.email,
            password: credentials.password
          });

          if (!result.success) {
            console.error('Validation error:', result.error.errors);
            throw new Error(result.error.errors[0].message);
          }

          await connectDB();

          // — Sécurité : TOUTE session exige la preuve 2FA serveur —
          // Le mot de passe réel n'est jamais accepté ici : il est vérifié
          // par /api/auth/send-2fa (étape 1). Sans preuve signée, pas de session.
          if (credentials.password !== TWOFA_PASSAGE_TOKEN) {
            throw new Error('Vérification en deux étapes requise');
          }

          const normalizedEmail = String(credentials.email).toLowerCase();
          const proof = readCookieHeader(req?.headers?.cookie, TWOFA_COOKIE_NAME);
          if (!verifyTwoFaProof(proof, normalizedEmail)) {
            console.warn('2FA: preuve absente ou invalide');
            throw new Error('Vérification en deux étapes requise ou expirée');
          }

          const admin = await Admin.findOne({ email: credentials.email });

          if (!admin) {
            // Compte par défaut (env) : autorisé UNIQUEMENT avec preuve 2FA
            // valide — plus aucun contournement possible.
            if (normalizedEmail === String(process.env.ADMIN_EMAIL || '').toLowerCase()) {
              return {
                id: 'default-admin',
                email: process.env.ADMIN_EMAIL,
                name: 'Admin',
                role: 'admin',
              };
            }
            console.error('Admin not found');
            throw new Error('Utilisateur non trouvé');
          }

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
