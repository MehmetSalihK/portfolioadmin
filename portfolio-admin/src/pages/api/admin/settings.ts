import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import Setting from "@/models/Setting";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Allow public GET access for frontend — source unique du contenu du site.
  if (req.method === "GET") {
    try {
      await connectDB();

      // Récupérer les settings ou créer des valeurs par défaut si elles n'existent pas
      let settings = await Setting.findOne();

      if (!settings) {
        settings = {
          siteTitle: "Portfolio",
          siteDescription: "Mon portfolio professionnel",
        } as any;
      }

      return res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  }

  const guard = await requireAdmin(req, res);
  if (!guard) return;

  if (req.method === "POST") {
    try {
      await connectDB();

      // Anti opérateur Mongo / pollution de prototype : le spread
      // `...req.body` partait tel quel dans findOneAndUpdate (un champ
      // `$inc`/`$unset` au top-level était traité comme un opérateur).
      const rawBody = req.body;
      if (
        !rawBody ||
        typeof rawBody !== "object" ||
        Array.isArray(rawBody) ||
        Object.keys(rawBody).some(
          (k) => k.startsWith("$") || ["__proto__", "constructor", "prototype"].includes(k),
        )
      ) {
        return res.status(400).json({ error: "Corps de requête invalide" });
      }
      const body = rawBody as Record<string, unknown>;

      // Source unique : le document `Setting` (singleton) est la vérité
      // centrale du contenu du site. Plus de duplication vers les modèles
      // `Settings` / `HomePage` (Phase 3 — content management centralisé).
      const updated = await Setting.findOneAndUpdate(
        {},
        {
          siteTitle: String(body.siteTitle || "Portfolio"),
          siteTitle_en: String(body.siteTitle_en || ""),
          siteTitle_tr: String(body.siteTitle_tr || ""),
          siteDescription: String(body.siteDescription || ""),
          siteDescription_en: String(body.siteDescription_en || ""),
          siteDescription_tr: String(body.siteDescription_tr || ""),
          aboutTitle: String(body.aboutTitle || ""),
          aboutTitle_en: String(body.aboutTitle_en || ""),
          aboutTitle_tr: String(body.aboutTitle_tr || ""),
          aboutBio: String(body.aboutBio || ""),
          aboutBio_en: String(body.aboutBio_en || ""),
          aboutBio_tr: String(body.aboutBio_tr || ""),
          aboutImage: String(body.aboutImage || ""),
          email: String(body.email || ""),
          phone: String(body.phone || ""),
          position: String(body.position || ""),
          position_en: String(body.position_en || ""),
          position_tr: String(body.position_tr || ""),
          github: String(body.github || ""),
          linkedin: String(body.linkedin || ""),
          twitter: String(body.twitter || ""),
          whatsapp: String(body.whatsapp || ""),
          telegram: String(body.telegram || ""),
        },
        { upsert: true, new: true },
      );

      return res.status(200).json(updated);
    } catch (error) {
      console.error("Settings update error:", error);
      return res.status(500).json({ error: "Failed to update settings" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
