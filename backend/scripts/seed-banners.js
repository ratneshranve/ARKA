import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudinary, isCloudinaryConfigured } from '../src/config/cloudinary.js';
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Banner } from '../src/models/Banner.js';

const BANNERS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../frontend/public/images/banners',
);

async function uploadBannerImage(filename, publicIdSuffix, alt) {
  const filePath = path.join(BANNERS_DIR, filename);

  if (!isCloudinaryConfigured) {
    console.log(`ℹ Local banner fallback: /images/banners/${filename}`);
    return {
      url: `/images/banners/${filename}`,
      publicId: `local-banner/${publicIdSuffix}`,
      width: 1920,
      height: 1080,
      alt,
    };
  }

  console.log(`☁ Uploading ${filename} to Cloudinary...`);
  const res = await cloudinary.uploader.upload(filePath, {
    folder: `${env.CLOUDINARY_FOLDER}/banners`,
    public_id: publicIdSuffix,
    overwrite: true,
    resource_type: 'image',
  });

  console.log(`   ✔ Uploaded: ${res.public_id} (${res.secure_url})`);
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width || 1920,
    height: res.height || 1080,
    alt,
  };
}

async function run() {
  console.log('Connecting to database...');
  await connectDB();

  console.log('Seeding 3 realistic solar energy banners...');

  const banner1Img = await uploadBannerImage(
    'sunrise-solar-panels-rooftop.png',
    'sunrise-solar-panels-rooftop',
    'Sunrise solar panels on modern rooftop',
  );

  const banner2Img = await uploadBannerImage(
    'commercial-solar-rooftop.jpg',
    'commercial-solar-rooftop',
    'Commercial rooftop solar installation on modern facility',
  );

  const banner3Img = await uploadBannerImage(
    'solar-farm-clean-energy.jpg',
    'solar-farm-clean-energy',
    'Expansive utility-scale solar farm across rolling hills',
  );

  const banners = [
    {
      title: 'Harness the Sun for a Greener Tomorrow',
      subtitle:
        'Rooftop and ground-mounted solar systems designed, supplied and installed end-to-end for modern homes and villas.',
      image: banner1Img,
      ctaLabel: 'Get a Free Quote',
      ctaLink: '/contact',
      order: 0,
      isActive: true,
    },
    {
      title: 'Powering Commerce & Industry with Clean Energy',
      subtitle:
        'Cut industrial power tariffs and optimize peak loads with high-capacity rooftop solar EPC solutions.',
      image: banner2Img,
      ctaLabel: 'Explore Projects',
      ctaLink: '/projects',
      order: 1,
      isActive: true,
    },
    {
      title: 'Utility-Scale & Agricultural Solar Solutions',
      subtitle:
        'From high-yield solar farms to solar irrigation pumping — dependable clean energy engineered for endurance.',
      image: banner3Img,
      ctaLabel: 'Explore Products',
      ctaLink: '/products',
      order: 2,
      isActive: true,
    },
  ];

  await Banner.deleteMany({});
  const created = await Banner.insertMany(banners);

  console.log(`✅ Successfully seeded ${created.length} banners in MongoDB!`);
  for (const b of created) {
    console.log(`   • [Slide ${b.order + 1}] "${b.title}" -> ${b.image.url}`);
  }

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('❌ Seeding banners failed:', err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
