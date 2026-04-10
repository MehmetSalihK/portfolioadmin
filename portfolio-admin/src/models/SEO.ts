import mongoose, { Schema, Document } from 'mongoose';

export interface ISEO extends Document {
    page: string;
    title: string;
    title_en?: string;
    title_tr?: string;
    description: string;
    description_en?: string;
    description_tr?: string;
    keywords: string[];
    ogImage?: string;
    updatedAt: Date;
}

const SEOSchema: Schema = new Schema({
    page: {
        type: String,
        required: true,
        unique: true,
        enum: ['home', 'projects', 'about', 'contact', 'blog']
    },
    title: { type: String, required: true },
    title_en: { type: String },
    title_tr: { type: String },
    description: { type: String, required: true },
    description_en: { type: String },
    description_tr: { type: String },
    keywords: [{ type: String }],
    ogImage: { type: String },
    updatedAt: { type: Date, default: Date.now }
});


export default mongoose.models?.SEO || mongoose.model<ISEO>('SEO', SEOSchema);
