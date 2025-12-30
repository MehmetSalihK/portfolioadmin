import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import { sendContactEmail } from '@/services/emailService';

// Simple in-memory rate limiting
const rateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  // Handle POST request (Public Contact Form)
  if (req.method === 'POST') {
    try {
      // Rate Limiting
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const ipString = Array.isArray(ip) ? ip[0] : ip;
      const now = Date.now();
      const userRequests = rateLimit.get(ipString) || 0;

      if (userRequests >= MAX_REQUESTS) {
        return res.status(429).json({ message: 'Too many requests, please try again later.' });
      }
      
      rateLimit.set(ipString, userRequests + 1);
      setTimeout(() => rateLimit.delete(ipString), RATE_LIMIT_WINDOW);

      const { name, email, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Save to Database
      const newContact = await Contact.create({
        name,
        email,
        subject: subject || 'No Subject',
        message,
        status: 'unread'
      });

      // Send Email Notification
      try {
        await sendContactEmail({
          name,
          email,
          subject: subject || 'No Subject',
          message
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue even if email fails, as DB save was successful
      }

      return res.status(201).json({ message: 'Message sent successfully', contact: newContact });
    } catch (error) {
      console.error('Error handling contact form:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // Handle GET request (Admin only)
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { status } = req.query;
      const query = status ? { status } : {};
      
      const messages = await Contact.find(query)
        .sort({ createdAt: -1 })
        .lean();
        
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ message: 'Failed to fetch messages' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}
