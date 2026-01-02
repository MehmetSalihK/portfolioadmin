import mongoose, { Schema, Document } from 'mongoose';

export interface ISEO extends Document {
    page: string;
    title: string;
    description: string;
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
    description: { type: String, required: true },
    keywords: [{ type: String }],
    ogImage: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.SEO || mongoose.model<ISEO>('SEO', SEOSchema);
