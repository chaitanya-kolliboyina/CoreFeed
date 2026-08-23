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
