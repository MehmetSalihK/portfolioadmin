import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier l'authentification
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  // Récupérer l'ID du message depuis l'URL
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de message invalide' });
  }

  try {
    await connectDB();
    
    // Vérifier si le message existe
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Traiter les différentes méthodes HTTP
    switch (req.method) {
      case 'PATCH':
        // Mettre à jour le statut du message
        const { status } = req.body;
        
        if (!status || !['read', 'archived'].includes(status)) {
          return res.status(400).json({ message: 'Statut invalide' });
        }
        
        message.status = status;
        await message.save();
        
        return res.status(200).json({ message: 'Statut mis à jour avec succès' });
        
      case 'DELETE':
        // Supprimer le message
        await Message.findByIdAndDelete(id);
        
        return res.status(200).json({ message: 'Message supprimé avec succès' });
        
      default:
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur lors de la gestion du message:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
} 