import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tags and sources...');

  const tagsData = [
    { slug: 'frontend', label: 'Frontend' },
    { slug: 'backend', label: 'Backend' },
    { slug: 'system-design', label: 'System Design' },
    { slug: 'devops', label: 'DevOps & Infrastructure' },
    { slug: 'react', label: 'React' },
    { slug: 'ai-ml', label: 'AI & Machine Learning' },
    { slug: 'mobile', label: 'Mobile Dev' },
    { slug: 'security', label: 'Cybersecurity' },
    { slug: 'databases', label: 'Databases & SQL' },
    { slug: 'typescript', label: 'TypeScript' },
    { slug: 'rust', label: 'Rust Programming' },
    { slug: 'web3', label: 'Web3 & Blockchain' },
    { slug: 'semiconductors', label: 'Semiconductors & Chip Design' },
    { slug: 'nuclear-engineering', label: 'Nuclear Engineering & Physics' },
    { slug: 'astrophysics', label: 'Astrophysics & Space Exploration' },
    { slug: 'quantum-computing', label: 'Quantum Computing' },
    { slug: 'bioengineering', label: 'Bioengineering & Genetics' },
    { slug: 'aerospace', label: 'Aerospace Engineering' },
    { slug: 'material-science', label: 'Material Science' },
    { slug: 'renewable-energy', label: 'Renewable Energy & Grid' },
    { slug: 'robotics', label: 'Robotics & Control Systems' },
    { slug: 'chemical-engineering', label: 'Chemical Engineering' },
    { slug: 'civil-structural', label: 'Civil & Structural Engineering' },
  ];

  const tags = await Promise.all(
    tagsData.map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      })
    )
  );
  console.log(`Created ${tags.length} tags.`);

  // 2. Sources (15 popular engineering blogs)
  const sourcesData = [
    {
      name: 'Cloudflare Blog',
      siteUrl: 'https://blog.cloudflare.com/',
      feedUrl: 'https://blog.cloudflare.com/rss/',
      tags: ['backend', 'devops', 'system-design'],
      hasFullFeed: true,
    },
    {
      name: 'Netflix TechBlog',
      siteUrl: 'https://netflixtechblog.com/',
      feedUrl: 'https://netflixtechblog.com/feed',
      tags: ['backend', 'system-design', 'ai-ml'],
      hasFullFeed: true,
    },
    {
      name: 'Uber Engineering',
      siteUrl: 'https://www.uber.com/en-IN/blog/engineering/',
      feedUrl: 'https://www.uber.com/en-IN/blog/engineering/rss/',
      tags: ['backend', 'system-design', 'mobile'],
      hasFullFeed: false, // mostly excerpts
    },
    {
      name: 'Martin Fowler',
      siteUrl: 'https://martinfowler.com/',
      feedUrl: 'https://martinfowler.com/feed.atom',
      tags: ['system-design', 'backend'],
      hasFullFeed: true,
    },
    {
      name: 'Overreacted (Dan Abramov)',
      siteUrl: 'https://overreacted.io/',
      feedUrl: 'https://overreacted.io/rss.xml',
      tags: ['frontend', 'react'],
      hasFullFeed: true,
    },
    {
      name: 'GitHub Engineering',
      siteUrl: 'https://github.blog/category/engineering/',
      feedUrl: 'https://github.blog/category/engineering/feed/',
      tags: ['devops', 'backend'],
      hasFullFeed: true,
    },
    {
      name: 'Discord Engineering',
      siteUrl: 'https://discord.com/blog/categories/engineering',
      feedUrl: 'https://discord.com/blog/rss.xml',
      tags: ['backend', 'system-design'],
      hasFullFeed: true,
    },
    {
      name: 'Airbnb Engineering',
      siteUrl: 'https://medium.com/airbnb-engineering',
      feedUrl: 'https://medium.com/feed/airbnb-engineering',
      tags: ['frontend', 'backend', 'ai-ml'],
      hasFullFeed: true,
    },
    {
      name: 'Slack Engineering',
      siteUrl: 'https://slack.engineering/',
      feedUrl: 'https://slack.engineering/feed/',
      tags: ['backend', 'frontend', 'system-design'],
      hasFullFeed: true,
    },
    {
      name: 'Meta Engineering',
      siteUrl: 'https://engineering.fb.com/',
      feedUrl: 'https://engineering.fb.com/feed/',
      tags: ['backend', 'system-design', 'ai-ml'],
      hasFullFeed: true,
    },
    {
      name: 'Vercel Blog',
      siteUrl: 'https://vercel.com/blog',
      feedUrl: 'https://vercel.com/atom',
      tags: ['frontend', 'react', 'devops'],
      hasFullFeed: false,
    },
    {
      name: 'Spotify Engineering',
      siteUrl: 'https://engineering.atspotify.com/',
      feedUrl: 'https://engineering.atspotify.com/feed/',
      tags: ['backend', 'mobile', 'ai-ml'],
      hasFullFeed: true,
    },
    {
      name: 'Stripe Engineering',
      siteUrl: 'https://stripe.com/blog/engineering',
      feedUrl: 'https://stripe.com/blog/engineering/rss',
      tags: ['backend', 'system-design'],
      hasFullFeed: false,
    },
    {
      name: 'Canva Engineering',
      siteUrl: 'https://www.canva.dev/blog/engineering/',
      feedUrl: 'https://www.canva.dev/blog/engineering/rss.xml',
      tags: ['frontend', 'backend', 'system-design'],
      hasFullFeed: true,
    },
    {
      name: 'Pinterest Engineering',
      siteUrl: 'https://medium.com/pinterest-engineering',
      feedUrl: 'https://medium.com/feed/pinterest-engineering',
      tags: ['ai-ml', 'backend', 'system-design'],
      hasFullFeed: true,
    },
    {
      name: 'NASA JPL News',
      siteUrl: 'https://www.jpl.nasa.gov/news',
      feedUrl: 'https://www.jpl.nasa.gov/feeds/news/',
      tags: ['astrophysics', 'aerospace', 'robotics'],
      hasFullFeed: true,
    },
    {
      name: 'CERN Courier',
      siteUrl: 'https://cerncourier.com/',
      feedUrl: 'https://cerncourier.com/feed/',
      tags: ['nuclear-engineering', 'quantum-computing', 'material-science'],
      hasFullFeed: true,
    },
    {
      name: 'ASML Insights',
      siteUrl: 'https://www.asml.com/en/news/stories',
      feedUrl: 'https://www.asml.com/feed', // mock feed URL for chip making
      tags: ['semiconductors', 'material-science', 'robotics'],
      hasFullFeed: false,
    },
    {
      name: 'Intel Labs Research',
      siteUrl: 'https://www.intel.com/content/www/us/en/research/intel-labs.html',
      feedUrl: 'https://www.intel.com/content/www/us/en/research/intel-labs.feed.xml',
      tags: ['semiconductors', 'quantum-computing', 'ai-ml'],
      hasFullFeed: true,
    },
    {
      name: 'MIT Technology Review',
      siteUrl: 'https://www.technologyreview.com/',
      feedUrl: 'https://www.technologyreview.com/feed/',
      tags: ['quantum-computing', 'bioengineering', 'renewable-energy'],
      hasFullFeed: false,
    },
    {
      name: 'SpaceX Mission Updates',
      siteUrl: 'https://www.spacex.com/',
      feedUrl: 'https://www.spacex.com/feed',
      tags: ['aerospace', 'robotics', 'material-science'],
      hasFullFeed: false,
    },
    {
      name: 'NREL Energy Research',
      siteUrl: 'https://www.nrel.gov/',
      feedUrl: 'https://www.nrel.gov/news/press/press.xml',
      tags: ['renewable-energy', 'chemical-engineering', 'civil-structural'],
      hasFullFeed: true,
    }
  ];

  for (const src of sourcesData) {
    const { tags: srcTags, ...srcData } = src;
    
    // Connect existing tags
    const tagConnects = srcTags.map((slug) => ({
      tag: { connect: { slug } }
    }));

    await prisma.source.upsert({
      where: { feedUrl: src.feedUrl },
      update: {},
      create: {
        ...srcData,
        tags: {
          create: tagConnects,
        },
      },
    });
  }

  console.log(`Created ${sourcesData.length} sources.`);

  // 3. Seed Mock Posts
  console.log('Seeding mock posts...');
  const allSources = await prisma.source.findMany();
  const allTags = await prisma.tag.findMany();

  const mockPosts = [
    {
      title: "Mars 2026: Designing the Next Generation of Exploration Rovers",
      url: "https://www.jpl.nasa.gov/news/mars-2026-rover",
      excerpt: "JPL engineers discuss the mechanical, computational, and scientific architecture behind the next Mars exploration payload, focusing on autonomous robotics and navigation.",
      wordCount: 1200,
      sourceName: "NASA JPL News",
      tagSlugs: ["astrophysics", "aerospace", "robotics"]
    },
    {
      title: "Exploring the Limits of Silicon: Quantum Dot Integration in Cleanrooms",
      url: "https://www.asml.com/en/news/quantum-dots",
      excerpt: "ASML insights into lithography improvements for quantum dot integration on standard CMOS wafers, paving the way for hybrid semiconductor quantum devices.",
      wordCount: 1500,
      sourceName: "ASML Insights",
      tagSlugs: ["semiconductors", "material-science", "quantum-computing"]
    },
    {
      title: "Fission vs Fusion: Nuclear Materials Under Extreme Neutron Irradiation",
      url: "https://cerncourier.com/nuclear-materials-fusion",
      excerpt: "A deep dive into structural damage modeling for reactor walls under high neutron fluxes, contrasting magnetic confinement fusion with standard heavy-water fission reactors.",
      wordCount: 2200,
      sourceName: "CERN Courier",
      tagSlugs: ["nuclear-engineering", "material-science"]
    },
    {
      title: "Silicon Photonics: Accelerating Chip-to-Chip Interconnects in Datacenters",
      url: "https://www.intel.com/research/silicon-photonics",
      excerpt: "Intel Labs demonstrates sub-picojoule-per-bit optical links integrated directly onto multi-chip modules, bypassing copper bandwidth bottlenecks.",
      wordCount: 950,
      sourceName: "Intel Labs Research",
      tagSlugs: ["semiconductors", "system-design"]
    },
    {
      title: "CRISPR-Cas12 Diagnostics: Engineering Programmable Nucleic Acid Detectors",
      url: "https://www.technologyreview.com/crispr-diagnostics",
      excerpt: "Recent advances in biological engineering utilize Cas12 and Cas13 endonucleases for rapid, paper-strip-based diagnostic sensing of viral pathogens.",
      wordCount: 1800,
      sourceName: "MIT Technology Review",
      tagSlugs: ["bioengineering"]
    },
    {
      title: "Aerodynamic Optimization of Starship Flight profiles during Landing",
      url: "https://www.spacex.com/starship-flight-profiles",
      excerpt: "SpaceX guidance controllers discuss the belly-flop maneuver and supersonic retropropulsion equations used to land heavy launch vehicles in thin atmospheres.",
      wordCount: 1400,
      sourceName: "SpaceX Mission Updates",
      tagSlugs: ["aerospace", "robotics"]
    },
    {
      title: "Solid-State Perovskite Solar Cells: Maximizing Solar Conversion Efficiency",
      url: "https://www.nrel.gov/perovskite-efficiency",
      excerpt: "NREL researchers catalog materials modifications to lead-halide perovskite structures to prevent thermal degradation under prolonged solar illumination.",
      wordCount: 1600,
      sourceName: "NREL Energy Research",
      tagSlugs: ["renewable-energy", "chemical-engineering"]
    }
  ];

  for (const post of mockPosts) {
    const source = allSources.find((s) => s.name === post.sourceName);
    if (!source) continue;

    // Connect tags
    const matchedTags = allTags.filter((t) => post.tagSlugs.includes(t.slug));
    const tagCreates = matchedTags.map((tag) => ({
      tag: { connect: { id: tag.id } }
    }));

    await prisma.post.upsert({
      where: { url: post.url },
      update: {},
      create: {
        title: post.title,
        url: post.url,
        excerpt: post.excerpt,
        wordCount: post.wordCount,
        publishedAt: new Date(),
        sourceId: source.id,
        tags: {
          create: tagCreates
        }
      }
    });
  }
  console.log(`Seeded ${mockPosts.length} mock posts.`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
