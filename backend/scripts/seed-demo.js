/**
 * Loads demo categories, products, projects, banners and site content for local development.
 * Usage: npm run seed:demo                  (refuses if products/projects already exist)
 *        npm run seed:demo -- --reset       (deletes existing catalogue data first)
 *        npm run seed:demo -- --local-images (skip Cloudinary, use /images/demo/*.svg)
 * When Cloudinary is configured, the demo illustrations in frontend/public/images/demo are uploaded
 * to Cloudinary (one copy per use, so deleting one item never removes another item's image).
 * Replace them with real photos from the admin panel.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudinary, isCloudinaryConfigured } from '../src/config/cloudinary.js';
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { Banner } from '../src/models/Banner.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { Project } from '../src/models/Project.js';
import { SiteSettings } from '../src/models/SiteSettings.js';
import { toSlug } from '../src/utils/slug.js';

if (env.isProd) {
  console.error('❌ seed:demo is for development only and refuses to run in production.');
  process.exit(1);
}

const reset = process.argv.includes('--reset');
const useCloudinary = isCloudinaryConfigured && !process.argv.includes('--local-images');
const DEMO_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../frontend/public/images/demo',
);
let uploaded = 0;

/**
 * Returns an Image sub-document for a demo illustration.
 * With Cloudinary: uploads it to `${CLOUDINARY_FOLDER}/${folder}/${key}`. Without: points at the local file.
 */
async function img(file, alt, { folder = 'site', key, width = 800, height = 600 } = {}) {
  if (!useCloudinary) {
    return { url: `/images/demo/${file}`, publicId: `local-demo/${file}`, width, height, alt };
  }
  const res = await cloudinary.uploader.upload(path.join(DEMO_DIR, file), {
    folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
    public_id: key || toSlug(file.replace(/\.svg$/, '')),
    overwrite: true,
    resource_type: 'image',
  });
  uploaded += 1;
  console.log(`   ↑ ${res.public_id}`);
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width || width,
    height: res.height || height,
    alt,
  };
}

/** Runs async fn over items one at a time (keeps Cloudinary uploads gentle and ordered). */
async function mapSeries(items, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += 1) out.push(await fn(items[i], i));
  return out;
}

const categories = [
  {
    name: 'Solar Panels',
    description: 'Mono PERC and bifacial modules for rooftop and ground-mount systems.',
  },
  { name: 'Inverters', description: 'On-grid, off-grid and hybrid solar inverters.' },
  { name: 'Batteries', description: 'Lithium and tubular batteries for solar storage.' },
  { name: 'Solar Water Heaters', description: 'ETC and FPC solar water heating systems.' },
  {
    name: 'Solar Street Lights',
    description: 'All-in-one and semi-integrated solar street lights.',
  },
  { name: 'Solar Pumps', description: 'Solar water pumps for agriculture and drinking water.' },
];

const products = [
  {
    name: 'ARKA Mono PERC 545W Solar Panel',
    category: 'Solar Panels',
    image: 'product-panel-mono.svg',
    shortDescription:
      'High-efficiency 144 half-cut cell mono PERC module for homes and businesses.',
    price: { amount: 14500, label: 'per panel', show: true },
    featured: true,
    specifications: [
      ['Peak power', '545 Wp'],
      ['Cell type', 'Mono PERC, 144 half-cut cells'],
      ['Module efficiency', '21.1%'],
      ['Dimensions', '2279 × 1134 × 35 mm'],
      ['Weight', '27.5 kg'],
      ['Product warranty', '12 years'],
      ['Performance warranty', '25 years linear'],
    ],
  },
  {
    name: 'Bifacial 550W Dual-Glass Module',
    category: 'Solar Panels',
    image: 'product-panel-bifacial.svg',
    shortDescription:
      'Generates power from both sides — ideal for ground-mount and elevated structures.',
    price: { amount: 16800, label: 'per panel', show: true },
    featured: true,
    specifications: [
      ['Peak power', '550 Wp (front)'],
      ['Bifacial gain', 'Up to 25%'],
      ['Glass', '2 mm + 2 mm heat-strengthened'],
      ['Performance warranty', '30 years'],
    ],
  },
  {
    name: '5 kW On-Grid Solar Inverter',
    category: 'Inverters',
    image: 'product-inverter-ongrid.svg',
    shortDescription: 'Dual-MPPT grid-tie inverter with Wi-Fi monitoring for net-metered rooftops.',
    price: { amount: 48000, label: 'starting from', show: true },
    featured: true,
    specifications: [
      ['Rated output', '5 kW'],
      ['MPPT trackers', '2'],
      ['Max efficiency', '98.4%'],
      ['Monitoring', 'Wi-Fi + mobile app'],
      ['Protection', 'IP65'],
      ['Warranty', '5 years'],
    ],
  },
  {
    name: '6 kVA Hybrid Solar Inverter',
    category: 'Inverters',
    image: 'product-inverter-hybrid.svg',
    shortDescription: 'Runs on solar, battery and grid with automatic switching and power backup.',
    price: { show: false },
    featured: true,
    specifications: [
      ['Rated output', '6 kVA / 48 V'],
      ['Battery support', 'Lithium & lead-acid'],
      ['Solar charger', 'MPPT, 120 A'],
      ['Warranty', '2 years'],
    ],
  },
  {
    name: '5 kWh Lithium (LiFePO4) Battery',
    category: 'Batteries',
    image: 'product-battery-lithium.svg',
    shortDescription: 'Long-life wall-mounted lithium battery with built-in BMS, 6000+ cycles.',
    price: { amount: 145000, label: 'per unit', show: true },
    featured: false,
    specifications: [
      ['Chemistry', 'LiFePO4'],
      ['Capacity', '5.12 kWh (51.2 V, 100 Ah)'],
      ['Cycle life', '6000+ @ 80% DoD'],
      ['Warranty', '10 years'],
    ],
  },
  {
    name: '150Ah Tall Tubular Solar Battery',
    category: 'Batteries',
    image: 'product-battery-tubular.svg',
    shortDescription: 'Deep-cycle tubular battery designed for daily solar charging.',
    price: { amount: 15500, label: 'per unit', show: true },
    featured: false,
    specifications: [
      ['Capacity', '150 Ah @ C10'],
      ['Type', 'Tall tubular, flooded'],
      ['Warranty', '5 years (36 + 24 months)'],
    ],
  },
  {
    name: '200 LPD ETC Solar Water Heater',
    category: 'Solar Water Heaters',
    image: 'product-water-heater.svg',
    shortDescription: 'Evacuated-tube water heater for families of 4–5, with an SS304 inner tank.',
    price: { amount: 24000, label: 'starting from', show: true },
    featured: true,
    specifications: [
      ['Capacity', '200 litres per day'],
      ['Collector', 'Evacuated tube (ETC), 20 tubes'],
      ['Inner tank', 'SS304, PUF insulated'],
    ],
  },
  {
    name: '30W All-in-One Solar Street Light',
    category: 'Solar Street Lights',
    image: 'product-street-light.svg',
    shortDescription: 'Integrated panel, lithium battery and LED with dusk-to-dawn motion sensing.',
    price: { show: false },
    featured: false,
    specifications: [
      ['LED power', '30 W'],
      ['Battery', 'LiFePO4, 12.8 V'],
      ['Backup', '2–3 nights'],
    ],
  },
  {
    name: '5 HP Solar Submersible Pump',
    category: 'Solar Pumps',
    image: 'product-pump.svg',
    shortDescription: 'Solar-powered borewell pump with VFD controller for irrigation.',
    price: { show: false },
    featured: true,
    specifications: [
      ['Motor', '5 HP, AC submersible'],
      ['Panel array', '4.8 kWp'],
      ['Head', 'Up to 100 m'],
    ],
  },
];

const projects = [
  {
    title: '10 kW Rooftop Solar for a Family Home',
    location: 'Bhopal, Madhya Pradesh',
    image: 'project-residential.svg',
    projectType: 'residential',
    capacity: '10 kW',
    months: 2,
    featured: true,
    shortDescription:
      'Net-metered rooftop system that cut the family’s electricity bill by over 90%.',
    details: [
      ['Panels', '18 × 545 Wp Mono PERC'],
      ['Inverter', '10 kW on-grid, dual MPPT'],
      ['Annual generation', '≈ 14,500 kWh'],
      ['Structure', 'Elevated GI structure'],
    ],
  },
  {
    title: '75 kW Commercial Rooftop — Shopping Complex',
    location: 'Indore, Madhya Pradesh',
    image: 'project-commercial.svg',
    projectType: 'commercial',
    capacity: '75 kW',
    months: 5,
    featured: true,
    shortDescription: 'Daytime load offset for a busy shopping complex with remote monitoring.',
    details: [
      ['Panels', '138 × 545 Wp'],
      ['Inverters', '3 × 25 kW'],
      ['Payback', '≈ 4 years'],
    ],
  },
  {
    title: '250 kW Industrial Shed Installation',
    location: 'Pithampur, Madhya Pradesh',
    image: 'project-industrial.svg',
    projectType: 'industrial',
    capacity: '250 kW',
    months: 8,
    featured: true,
    shortDescription:
      'Metal-sheet roof installation for a manufacturing unit with zero roof penetration clamps.',
    details: [
      ['Panels', '455 × 550 Wp bifacial'],
      ['Mounting', 'Mini-rail, non-penetrating'],
      ['CO₂ saved', '≈ 300 tonnes / year'],
    ],
  },
  {
    title: '1 MW Ground-Mounted Solar Plant',
    location: 'Sagar, Madhya Pradesh',
    image: 'project-ground.svg',
    projectType: 'commercial',
    capacity: '1 MW',
    months: 12,
    featured: false,
    shortDescription: 'Turnkey EPC of a ground-mounted plant feeding power to the grid.',
    details: [
      ['Land area', '≈ 4.5 acres'],
      ['Panels', '1,820 × 550 Wp'],
      ['Annual generation', '≈ 1.5 million kWh'],
    ],
  },
  {
    title: '40 kW Solar for a Senior Secondary School',
    location: 'Vidisha, Madhya Pradesh',
    image: 'project-institutional.svg',
    projectType: 'institutional',
    capacity: '40 kW',
    months: 14,
    featured: true,
    shortDescription:
      'Clean power for classrooms, labs and the hostel, with a student display board.',
    details: [
      ['Panels', '74 × 545 Wp'],
      ['Inverter', '40 kW on-grid'],
    ],
  },
  {
    title: 'Solar Pumps for 12 Farms',
    location: 'Hoshangabad, Madhya Pradesh',
    image: 'project-agricultural.svg',
    projectType: 'agricultural',
    capacity: '12 × 5 HP',
    months: 18,
    featured: true,
    shortDescription: 'Diesel-free irrigation for 12 farmers under the PM-KUSUM scheme.',
    details: [
      ['Pumps', '12 × 5 HP submersible'],
      ['Array per pump', '4.8 kWp'],
    ],
  },
];

const productDescription = (
  p,
) => `The **${p.name}** is supplied and installed by our in-house team, with genuine warranty support.

### Key benefits
- Reliable performance in Indian weather conditions
- Supplied with all required certificates
- Professional installation and after-sales service

Contact us for a site survey and a detailed quotation.`;

const projectDescription = (
  p,
) => `We delivered this ${p.capacity} ${p.projectType} solar project in ${p.location} — from site survey and design to installation, net-metering paperwork and commissioning.

### Scope of work
- Site survey and shadow analysis
- System design and structural planning
- Supply, installation and commissioning
- Net-metering / grid connection support`;

async function run() {
  await connectDB();

  const existing = (await Product.countDocuments()) + (await Project.countDocuments());
  if (existing && !reset) {
    console.error(
      '❌ Products or projects already exist. Re-run with `npm run seed:demo -- --reset` to replace them.',
    );
    await disconnectDB();
    process.exit(1);
  }
  if (reset) {
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      Project.deleteMany({}),
      Banner.deleteMany({}),
    ]);
  }

  const catDocs = await Category.insertMany(
    categories.map((c, i) => ({ ...c, slug: toSlug(c.name), order: i, isActive: true })),
  );
  const catId = Object.fromEntries(catDocs.map((c) => [c.name, c._id]));

  console.log(
    useCloudinary
      ? `☁  Uploading demo images to Cloudinary (${env.CLOUDINARY_FOLDER}/…)`
      : '🖼  Using local demo images',
  );

  let pf = 0;
  const productDocs = await mapSeries(products, async (p) => ({
    name: p.name,
    slug: toSlug(p.name),
    category: catId[p.category],
    shortDescription: p.shortDescription,
    description: productDescription(p),
    images: [await img(p.image, p.name, { folder: 'products', key: toSlug(p.name) })],
    specifications: p.specifications.map(([label, value]) => ({ label, value })),
    additionalInfo:
      'Prices are indicative and may vary with site conditions, quantity and current market rates. GST extra as applicable.',
    price: { amount: p.price.amount ?? null, label: p.price.label ?? '', show: p.price.show },
    isPublished: true,
    isFeatured: p.featured,
    featuredOrder: p.featured ? pf++ : 0,
  }));
  await Product.insertMany(productDocs);

  let jf = 0;
  const projectDocs = await mapSeries(projects, async (p, i) => {
    const slug = toSlug(p.title);
    const others = [projects[(i + 1) % projects.length], projects[(i + 2) % projects.length]];
    const completedOn = new Date();
    completedOn.setMonth(completedOn.getMonth() - p.months, 1);
    return {
      title: p.title,
      slug,
      location: p.location,
      shortDescription: p.shortDescription,
      description: projectDescription(p),
      coverImage: await img(p.image, p.title, { folder: 'projects', key: `${slug}-cover` }),
      gallery: await mapSeries(others, (o, g) =>
        img(o.image, `${p.title} — photo ${g + 1}`, {
          folder: 'projects',
          key: `${slug}-gallery-${g + 1}`,
        }),
      ),
      capacity: p.capacity,
      projectType: p.projectType,
      completedOn,
      details: p.details.map(([label, value]) => ({ label, value })),
      additionalInfo: '',
      isPublished: true,
      isFeatured: p.featured,
      featuredOrder: p.featured ? jf++ : 0,
    };
  });
  await Project.insertMany(projectDocs);

  const banner = (n, alt) =>
    img(`banner-${n}.svg`, alt, {
      folder: 'banners',
      key: `banner-${n}`,
      width: 1920,
      height: 800,
    });
  await Banner.insertMany([
    {
      title: 'Harness the Sun for a Greener Tomorrow',
      subtitle:
        'Rooftop and ground-mounted solar systems designed, supplied and installed end-to-end.',
      image: await banner(1, 'Solar panel array at sunrise'),
      ctaLabel: 'Get a Free Quote',
      ctaLink: '/contact',
      order: 0,
    },
    {
      title: 'Cut Your Electricity Bill by up to 90%',
      subtitle:
        'Net-metered home solar with genuine panels, smart inverters and 25-year performance warranty.',
      image: await banner(2, 'Home with rooftop solar panels'),
      ctaLabel: 'Explore Products',
      ctaLink: '/products',
      order: 1,
    },
    {
      title: 'Solar for Industry & Agriculture',
      subtitle: 'From 100 kW factory rooftops to solar irrigation pumps — see what we have built.',
      image: await banner(3, 'Industrial shed with solar panels'),
      ctaLabel: 'View Projects',
      ctaLink: '/projects',
      order: 2,
    },
  ]);

  const introImage = await img(
    'project-residential.svg',
    'Rooftop solar installation by ARKA Solar Energy',
    { key: 'home-intro' },
  );
  const aboutHero = await img('banner-2.svg', 'Solar-powered home', {
    key: 'about-hero',
    width: 1920,
    height: 800,
  });

  await SiteSettings.findOneAndUpdate(
    {},
    {
      $set: {
        'home.introImage': introImage,
        'about.heroImage': aboutHero,
        'home.introText':
          'ARKA Solar Energy helps homes, businesses, institutions and farms switch to clean, affordable solar power. We handle everything — site survey, system design, genuine products, installation, net-metering paperwork and after-sales service — so you can start saving from day one.',
        'about.overview':
          'ARKA Solar Energy is a solar EPC and products company providing complete solar solutions — from a single rooftop to megawatt-scale plants.',
        'about.background':
          'Founded by engineers passionate about renewable energy, we started with small residential rooftops and have grown into a trusted partner for commercial, industrial and agricultural customers.',
        'about.businessInfo':
          '- Solar EPC for residential, commercial and industrial projects\n- Supply of solar panels, inverters, batteries and accessories\n- Solar water heaters, street lights and pumps\n- Operation & maintenance services',
        'about.experience':
          'Our team has designed and installed systems across Madhya Pradesh, working with leading panel and inverter brands and following MNRE and DISCOM guidelines.',
        'about.vision':
          'To make clean, affordable solar energy accessible to every home, business and farm.',
        'about.mission':
          'To deliver reliable, high-quality solar systems with honest advice, professional installation and long-term support.',
        'contact.phones': ['+91 90000 00000'],
        'contact.emails': ['info@example.com'],
        'contact.address': 'Your office address, City, State – PIN',
        'contact.workingHours': 'Mon–Sat, 9:30 AM – 6:30 PM',
        'legal.privacyPolicy':
          '## Information we collect\nWhen you submit an enquiry or contact form we collect your name, phone number, email address and message.\n\n## How we use it\nWe use this information only to respond to your enquiry and provide our services. We do not sell your data.\n\n## Contact\nFor any privacy questions, contact us using the details on our Contact page.\n\n_This is placeholder text — replace it with your reviewed policy from Admin › Site Settings › Legal Pages._',
        'legal.termsAndConditions':
          '## Use of this website\nThe information on this website is for general guidance only.\n\n## Prices\nPrices shown are indicative and may change without notice. Final prices are confirmed in a written quotation.\n\n## Warranty\nProduct warranties are as provided by the respective manufacturers.\n\n_This is placeholder text — replace it with your reviewed terms from Admin › Site Settings › Legal Pages._',
        'legal.updatedAt': new Date(),
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  console.log(
    `✅ Demo data loaded: ${catDocs.length} categories, ${products.length} products, ${projects.length} projects, 3 banners.`,
  );
  if (useCloudinary) console.log(`   ${uploaded} images uploaded to Cloudinary.`);
  await disconnectDB();
}

run().catch(async (err) => {
  console.error('❌ seed-demo failed:', err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
