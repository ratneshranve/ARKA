import mongoose from 'mongoose';
import { ImageSchema } from './shared.js';

const img = { type: ImageSchema, default: null };
const md = { type: String, default: '', maxlength: 20000 };

const SiteSettingsSchema = new mongoose.Schema(
  {
    company: {
      name: { type: String, default: 'ARKA Solar Energy' },
      tagline: { type: String, default: 'Harness the Sun for a Greener Tomorrow' },
      logo: img,
      logoLight: img,
      footerAbout: {
        type: String,
        default:
          'ARKA Solar Energy designs, supplies and installs reliable solar power systems for homes, businesses, industries and farms.',
      },
    },
    home: {
      introTitle: { type: String, default: 'Powering homes and businesses with clean solar energy' },
      introText: md,
      introImage: img,
    },
    about: {
      heroImage: img,
      overview: md,
      background: md,
      businessInfo: md,
      experience: md,
      vision: md,
      mission: md,
    },
    contact: {
      phones: { type: [String], default: [] },
      emails: { type: [String], default: [] },
      address: { type: String, default: '' },
      mapEmbedUrl: { type: String, default: '' },
      workingHours: { type: String, default: '' },
    },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      x: { type: String, default: '' },
    },
    legal: {
      privacyPolicy: md,
      termsAndConditions: md,
      updatedAt: { type: Date, default: null },
    },
    seo: {
      defaultTitle: { type: String, default: 'ARKA Solar Energy — Solar Products & Installations' },
      defaultDescription: {
        type: String,
        default:
          'ARKA Solar Energy supplies solar panels, inverters and batteries and installs rooftop and ground-mounted solar systems.',
      },
      ogImage: img,
    },
    notifications: {
      enquiryEmails: { type: [String], default: [] },
    },
  },
  { timestamps: true, minimize: false },
);

export const SiteSettings = mongoose.model('SiteSettings', SiteSettingsSchema);

export const SETTINGS_SECTIONS = ['company', 'home', 'about', 'contact', 'social', 'legal', 'seo', 'notifications'];

/** Image fields per section, used to clean up replaced images on Cloudinary. */
export const SETTINGS_IMAGE_FIELDS = {
  company: ['logo', 'logoLight'],
  home: ['introImage'],
  about: ['heroImage'],
  seo: ['ogImage'],
};
