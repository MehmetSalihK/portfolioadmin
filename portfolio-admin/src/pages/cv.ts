import { GetServerSideProps } from 'next';
import connectDB from '../lib/db';
import CV from '../models/CV';
import fs from 'fs';
import path from 'path';

export default function CVPage() {
  return null; // Cette page ne rend rien car elle redirige
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    await connectDB();
    
    const cv = await CV.findOne({ isActive: true });
    
    if (!cv) {
      return {
        notFound: true
      };
    }

    const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
    let fileBuffer: Buffer;
    
    if (isVercel && cv.data) {
      fileBuffer = Buffer.from(cv.data, 'base64');
    } else {
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'cv', cv.filename);
      
      if (!fs.existsSync(filePath)) {
        return {
          notFound: true
        };
      }
      
      fileBuffer = fs.readFileSync(filePath);
    }
    
    res.setHeader('Content-Type', cv.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cv.originalName}"`);
    res.write(fileBuffer);
    res.end();
    
    return {
      props: {}
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du CV:', error);
    return {
      notFound: true
    };
  }
}