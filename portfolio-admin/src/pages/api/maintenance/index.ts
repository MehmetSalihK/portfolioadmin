import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '@/lib/db';
import Maintenance from '@/models/Maintenance';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  if (req.method === 'GET') {
    // Récupérer le statut de maintenance (accessible à tous)
    try {
      let maintenance = await Maintenance.findOne();

      if (!maintenance) {
        // Créer un document de maintenance par défaut
        maintenance = new Maintenance({
          isEnabled: false,
          title: 'Site en maintenance',
          message: 'Le site est actuellement en maintenance. Veuillez revenir plus tard.'
        });
        await maintenance.save();
      }

      const now = new Date();
      let isActive = maintenance.isEnabled;

      if (!isActive && maintenance.startTime && maintenance.endTime) {
        isActive = now >= maintenance.startTime && now <= maintenance.endTime;
      } else if (!isActive && maintenance.startTime && !maintenance.endTime) {
        isActive = now >= maintenance.startTime;
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return res.status(200).json({ ...maintenance.toObject(), isActive });
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      return res.status(500).json({ message: 'Failed to fetch maintenance status' });
    }
  }

  // Pour les autres méthodes, vérifier l'authentification
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    // Mettre à jour le mode maintenance
    try {
      const {
        isEnabled,
        title,
        message,
        estimatedEndTime,
        startTime,
        endTime,
        allowedIPs
      } = req.body;

      let maintenance = await Maintenance.findOne();

      if (!maintenance) {
        maintenance = new Maintenance();
      }

      // Mettre à jour les champs
      if (typeof isEnabled === 'boolean') {
        maintenance.isEnabled = isEnabled;

        if (isEnabled) {
          maintenance.enabledBy = session.user.id;
          maintenance.enabledAt = new Date();
          maintenance.disabledAt = undefined;
        } else {
          maintenance.disabledAt = new Date();
        }
      }

      if (title) maintenance.title = title;
      if (message) maintenance.message = message;
      if (estimatedEndTime) maintenance.estimatedEndTime = new Date(estimatedEndTime);
      if (req.body.startTime) maintenance.startTime = new Date(req.body.startTime);
      if (req.body.endTime) maintenance.endTime = new Date(req.body.endTime);
      if (allowedIPs) maintenance.allowedIPs = allowedIPs;

      await maintenance.save();

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      return res.status(200).json({
        message: `Maintenance mode ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        maintenance
      });
    } catch (error) {
      console.error('Error updating maintenance mode:', error);
      return res.status(500).json({ message: 'Failed to update maintenance mode' });
    }
  }

  if (req.method === 'POST') {
    // Activer/désactiver rapidement le mode maintenance
    try {
      const { action } = req.body;

      if (!action || !['enable', 'disable'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Use "enable" or "disable"' });
      }

      let maintenance = await Maintenance.findOne();

      if (!maintenance) {
        maintenance = new Maintenance();
      }

      maintenance.isEnabled = action === 'enable';

      if (action === 'enable') {
        maintenance.enabledBy = session.user.id;
        maintenance.enabledAt = new Date();
        maintenance.disabledAt = undefined;
      } else {
        maintenance.disabledAt = new Date();
      }

      await maintenance.save();

      return res.status(200).json({
        message: `Maintenance mode ${action}d successfully`,
        maintenance
      });
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      return res.status(500).json({ message: 'Failed to toggle maintenance mode' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
}