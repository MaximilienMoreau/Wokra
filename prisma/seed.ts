import { PrismaClient, ArtifactType, VerificationMethod } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

faker.seed(42);

const SKILLS: { slug: string; name: string }[] = [
  { slug: "typescript", name: "TypeScript" },
  { slug: "javascript", name: "JavaScript" },
  { slug: "react", name: "React" },
  { slug: "nextjs", name: "Next.js" },
  { slug: "vue", name: "Vue" },
  { slug: "node-js", name: "Node.js" },
  { slug: "python", name: "Python" },
  { slug: "django", name: "Django" },
  { slug: "rust", name: "Rust" },
  { slug: "go", name: "Go" },
  { slug: "postgresql", name: "PostgreSQL" },
  { slug: "graphql", name: "GraphQL" },
  { slug: "docker", name: "Docker" },
  { slug: "kubernetes", name: "Kubernetes" },
  { slug: "terraform", name: "Terraform" },
  { slug: "aws", name: "AWS" },
  { slug: "machine-learning", name: "Machine Learning" },
  { slug: "data-engineering", name: "Data Engineering" },
  { slug: "swift", name: "Swift" },
  { slug: "flutter", name: "Flutter" },
  { slug: "tailwind-css", name: "Tailwind CSS" },
  { slug: "ci-cd", name: "CI/CD" },
  { slug: "security", name: "Security" },
  { slug: "web-performance", name: "Web Performance" },
];

const ROLES = [
  "Backend engineer",
  "Frontend engineer",
  "Full-stack developer",
  "Platform engineer",
  "Data engineer",
  "Mobile developer",
  "DevOps engineer",
  "Machine learning engineer",
  "Site reliability engineer",
  "Security engineer",
];

const FOCUS_AREAS = [
  "distributed systems",
  "developer tooling",
  "design systems",
  "data pipelines",
  "cloud infrastructure",
  "API design",
  "performance optimization",
  "open source maintenance",
  "accessibility",
  "product engineering",
];

function generateBio(): string {
  const role = faker.helpers.arrayElement(ROLES);
  const focus = faker.helpers.arrayElement(FOCUS_AREAS);
  const years = faker.number.int({ min: 2, max: 15 });
  return `${role} with ${years} years of experience, focused on ${focus}.`;
}

const ARTIFACT_TITLES: Record<ArtifactType, string[]> = {
  [ArtifactType.REPO]: [
    "Parser SQL écrit en Rust",
    "Client GraphQL minimaliste",
    "Librairie de validation de formulaires",
    "CLI de migration de base de données",
    "Moteur de règles métier",
  ],
  [ArtifactType.PRODUCT]: [
    "Suivi de dépenses partagées",
    "Générateur de CV à partir de GitHub",
    "Tableau de bord de monitoring self-hosted",
    "Outil de planification d'équipe",
    "Éditeur de diagrammes collaboratif",
  ],
  [ArtifactType.CASE_STUDY]: [
    "Migration d'un monolithe vers des services découplés",
    "Réduction du TTFB de 40% sur une app e-commerce",
    "Mise en place d'un pipeline CI/CD multi-environnements",
    "Refonte du système de permissions d'une plateforme SaaS",
    "Passage à l'échelle d'une base PostgreSQL à 200M de lignes",
  ],
  [ArtifactType.CONTRIBUTION]: [
    "Correction d'une fuite mémoire dans un moteur de rendu open source",
    "Ajout du support TypeScript strict à une librairie populaire",
    "Amélioration de l'accessibilité clavier d'un composant UI",
    "Optimisation du bundle size d'un framework front-end",
    "Documentation de l'API publique d'un projet open source",
  ],
};

function pickMany<T>(items: T[], count: number): T[] {
  return faker.helpers.arrayElements(items, count);
}

async function main() {
  await prisma.message.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const skills = await Promise.all(SKILLS.map((skill) => prisma.skill.create({ data: skill })));

  const users = await Promise.all(
    Array.from({ length: 15 }).map(async () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const handle = faker.internet
        .username({ firstName, lastName })
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

      const userSkills = pickMany(skills, faker.number.int({ min: 3, max: 6 }));
      const interestPool = skills.filter((s) => !userSkills.includes(s));
      const userInterests = pickMany(interestPool, faker.number.int({ min: 2, max: 4 }));

      return prisma.user.create({
        data: {
          handle,
          name: `${firstName} ${lastName}`,
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          avatarUrl: faker.image.avatarGitHub(),
          bio: generateBio(),
          githubId: faker.datatype.boolean(0.7) ? faker.string.numeric(8) : null,
          skills: { create: userSkills.map((skill) => ({ skillId: skill.id })) },
          interests: {
            create: userInterests.map((skill) => ({ skillId: skill.id })),
          },
        },
      });
    }),
  );

  const artifactTypes = Object.values(ArtifactType);
  const targetArtifactCount = 40;

  for (let i = 0; i < targetArtifactCount; i++) {
    const user = faker.helpers.arrayElement(users);
    const type = faker.helpers.arrayElement(artifactTypes);
    const title = faker.helpers.arrayElement(ARTIFACT_TITLES[type]);
    const isVerifiable = type === ArtifactType.REPO || type === ArtifactType.PRODUCT;
    const verified = isVerifiable && faker.datatype.boolean(0.5);

    await prisma.artifact.create({
      data: {
        userId: user.id,
        type,
        title,
        description: faker.lorem.paragraph(),
        url:
          type === ArtifactType.REPO
            ? `https://github.com/${user.handle}/${faker.helpers.slugify(title).toLowerCase()}`
            : faker.internet.url(),
        stack: pickMany(
          SKILLS.map((s) => s.name),
          faker.number.int({ min: 2, max: 5 }),
        ),
        verified,
        verifiedVia: verified
          ? type === ArtifactType.REPO
            ? VerificationMethod.GITHUB_REPO
            : VerificationMethod.DNS_TXT
          : null,
        verifiedAt: verified ? faker.date.recent({ days: 90 }) : null,
      },
    });
  }

  for (const follower of users) {
    const others = users.filter((u) => u.id !== follower.id);
    const following = pickMany(others, faker.number.int({ min: 2, max: 5 }));
    await prisma.follow.createMany({
      data: following.map((following) => ({
        followerId: follower.id,
        followingId: following.id,
      })),
      skipDuplicates: true,
    });
  }

  const follows = await prisma.follow.findMany({ take: 8 });
  for (const { followerId, followingId } of follows) {
    const exchangeLength = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < exchangeLength; i++) {
      const [senderId, receiverId] =
        i % 2 === 0 ? [followerId, followingId] : [followingId, followerId];
      await prisma.message.create({
        data: {
          senderId,
          receiverId,
          body: faker.lorem.sentence(),
          readAt: faker.datatype.boolean(0.6) ? faker.date.recent({ days: 10 }) : null,
        },
      });
    }
  }

  console.log(
    `Seeded ${users.length} users, ${skills.length} skills, ${targetArtifactCount} artifacts.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
