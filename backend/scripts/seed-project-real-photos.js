import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudinary, isCloudinaryConfigured } from '../src/config/cloudinary.js';
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Project } from '../src/models/Project.js';

const DEMO_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../frontend/public/images/demo',
);
const BANNERS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../frontend/public/images/banners',
);

async function uploadImage(file, key, alt, isBanner = false) {
  const dir = isBanner ? BANNERS_DIR : DEMO_DIR;
  const filePath = path.join(dir, file);

  if (!isCloudinaryConfigured) {
    const url = isBanner ? `/images/banners/${file}` : `/images/demo/${file}`;
    return { url, publicId: `local/${key}`, width: 1200, height: 800, alt };
  }

  console.log(`   ↑ Uploading ${file} to Cloudinary...`);
  const res = await cloudinary.uploader.upload(filePath, {
    folder: `${env.CLOUDINARY_FOLDER}/projects`,
    public_id: key,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`     ✔ Uploaded: ${res.public_id}`);
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width || 1200,
    height: res.height || 800,
    alt,
  };
}

async function run() {
  console.log('Connecting to database...');
  await connectDB();

  // Delete institutional projects if any remain
  await Project.deleteMany({ projectType: 'institutional' });

  console.log('Uploading real-world solar photos to Cloudinary...');

  // Residential photos
  const resCover = await uploadImage('project-residential.jpg', 'project-residential-real-1', 'Residential rooftop solar installation');
  const resGal1 = await uploadImage('sunrise-solar-panels-rooftop.png', 'project-residential-real-2', 'Sunrise solar panels on modern rooftop', true);
  const resGal2 = await uploadImage('project-residential-2.jpg', 'project-residential-real-3', 'Modern villa monocrystalline solar system');

  // Commercial photos
  const comCover = await uploadImage('project-commercial.jpg', 'project-commercial-real-1', 'Commercial shopping complex rooftop solar');
  const comGal1 = await uploadImage('commercial-solar-rooftop.jpg', 'project-commercial-real-2', 'Modern commercial facility solar arrays', true);
  const comGal2 = await uploadImage('banner-2.jpg', 'project-commercial-real-3', 'Commercial enterprise solar installation');

  // Ground mounted commercial
  const gndCover = await uploadImage('solar-farm-clean-energy.jpg', 'project-ground-real-1', 'Utility scale solar farm arrays', true);

  // Industrial photos
  const indCover = await uploadImage('project-industrial.jpg', 'project-industrial-real-1', 'Industrial factory shed solar installation');
  const indGal1 = await uploadImage('project-industrial-2.jpg', 'project-industrial-real-2', 'Large manufacturing plant rooftop solar array');

  // Agricultural photos
  const agrCover = await uploadImage('project-agricultural.jpg', 'project-agricultural-real-1', 'Solar irrigation water pump on farmland');
  const agrGal1 = await uploadImage('project-agricultural-2.jpg', 'project-agricultural-real-2', 'Agricultural solar panel array powering irrigation pipe');

  console.log('Updating project records with real photos...');

  // Update Residential
  await Project.updateMany(
    { projectType: 'residential' },
    {
      $set: {
        coverImage: resCover,
        gallery: [resGal1, resGal2],
      },
    },
  );

  // Update Commercial (75 kW rooftop)
  await Project.updateMany(
    { projectType: 'commercial', title: { $regex: /75\s*kW/i } },
    {
      $set: {
        coverImage: comCover,
        gallery: [comGal1, comGal2],
      },
    },
  );

  // Update Commercial (1 MW ground-mounted)
  await Project.updateMany(
    { projectType: 'commercial', title: { $regex: /1\s*MW/i } },
    {
      $set: {
        coverImage: gndCover,
        gallery: [comCover, comGal1],
      },
    },
  );

  // Update Industrial
  await Project.updateMany(
    { projectType: 'industrial' },
    {
      $set: {
        coverImage: indCover,
        gallery: [indGal1, comGal1],
      },
    },
  );

  // Update Agricultural
  await Project.updateMany(
    { projectType: 'agricultural' },
    {
      $set: {
        coverImage: agrCover,
        gallery: [agrGal1, gndCover],
      },
    },
  );

  const updatedProjects = await Project.find().select('title projectType coverImage gallery').lean();
  console.log(`✅ Successfully updated ${updatedProjects.length} projects with real-world photos:`);
  for (const p of updatedProjects) {
    console.log(`   • [${p.projectType}] ${p.title}`);
    console.log(`       cover: ${p.coverImage?.url}`);
    console.log(`       gallery: ${p.gallery?.map((g) => g.url).join(', ')}`);
  }

  await disconnectDB();
}

run().catch(async (err) => {
  console.error('❌ Failed to update project photos:', err);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
