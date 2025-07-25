import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import Company from '@/models/Company';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          
          const user = await User.findOne({ email: credentials.email });
          
          if (!user || !user.password) {
            return null;
          }

          // Check if user is verified
          if (!user.emailVerified) {
            // Attach a custom error for unverified accounts
            const error: any = new Error('Email not verified');
            error.code = 'EMAIL_NOT_VERIFIED';
            throw error;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          // If the error is for unverified email, rethrow for NextAuth to handle
          if (error instanceof Error && (error as any).code === 'EMAIL_NOT_VERIFIED') {
            throw error;
          }
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email });

          let newUser;
          if (!existingUser) {
            // Create new user
            newUser = new User({
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: new Date(),
              accounts: [{
                id: account.providerAccountId,
                userId: user.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                refresh_token: account.refresh_token,
                scope: account.scope,
                token_type: account.token_type,
                id_token: account.id_token,
                session_state: account.session_state,
              }]
            });
            
            await newUser.save();
            console.log('Google user created:', newUser.email);
          }
          
          // For both new and existing Google users, update all their companies with their email
          const userToUpdate = newUser || existingUser;
          if (userToUpdate && userToUpdate.email) {
            await Company.updateMany(
              { user: userToUpdate._id },
              { 
                $set: { 
                  emailConfig: {
                    recipients: [userToUpdate.email],
                    enabled: true
                  }
                } 
              }
            );
          }

          return true;
        } catch (error) {
          console.error('Error creating Google user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}; 