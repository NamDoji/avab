const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const SUBJECT_MAP = [
  { order: 1,  id: 'cmr1kugoo0001jwcdtddvwavt', name: 'Hello & My Name',    slug: 'hello' },
  { order: 2,  id: 'cmr1kuhqq0003jwcdbcg2misp', name: 'Colors',              slug: 'colors' },
  { order: 3,  id: 'cmr1kuiql0005jwcdnnufittr', name: 'Numbers',             slug: 'numbers' },
  { order: 4,  id: 'cmr1kujud0007jwcde1dn9j8x', name: 'Shapes',              slug: 'shapes' },
  { order: 5,  id: 'cmr1kul110009jwcdghwhdkne', name: 'Big & Small',         slug: 'big-small' },
  { order: 6,  id: 'cmr1kum65000bjwcdfqjfbfpi', name: 'My Body',             slug: 'my-body' },
  { order: 7,  id: 'cmr1kun8i000djwcd72lb2wju', name: 'My Family',           slug: 'my-family' },
  { order: 8,  id: 'cmr1kuo9n000fjwcdsti4zlel', name: 'Animals',             slug: 'animals' },
  { order: 9,  id: 'cmr1kuplx000hjwcdvbk0lpyk', name: 'Fruits',              slug: 'fruits' },
  { order: 10, id: 'cmr1kuqo6000jjwcd2ik8ct6o', name: 'Food & Drinks',      slug: 'food-drinks' },
  { order: 11, id: 'cmr1kurn9000ljwcdy00a2xfo', name: 'Toys',                slug: 'toys' },
  { order: 12, id: 'cmr1kusoe000njwcdgp2q70gq', name: 'Classroom Objects',   slug: 'classroom' },
  { order: 13, id: 'cmr1kutni000pjwcd2zfnm6ca', name: 'Actions',             slug: 'actions' },
  { order: 14, id: 'cmr1kuup5000rjwcduwqzrxkq', name: 'Feelings',            slug: 'feelings' },
  { order: 15, id: 'cmr1kuvru000tjwcd3q40xgj2', name: 'Weather',             slug: 'weather' },
  { order: 16, id: 'cmr1kuwyj000vjwcdwkc2ihst', name: 'Clothes',             slug: 'clothes' },
  { order: 17, id: 'cmr1kuy58000xjwcd9khm4p9c', name: 'Places',              slug: 'places' },
  { order: 18, id: 'cmr1kuz7c000zjwcdm9rdjf06', name: 'Transportation',      slug: 'transportation' },
  { order: 19, id: 'cmr1kv0760011jwcdpqowboqs', name: 'Position Words',      slug: 'position-words' },
  { order: 20, id: 'cmr1kv1g90013jwcd4308bsn4', name: 'Daily Routine',       slug: 'daily-routine' },
];

async function main() {
  const contentDir = path.join(__dirname, '..', 'content', 'english');
  let created = 0;
  let skipped = 0;

  for (const subject of SUBJECT_MAP) {
    const orderPadded = String(subject.order).padStart(2, '0');
    const fileName = `topic-${orderPadded}-${subject.slug}.md`;
    const filePath = path.join(contentDir, fileName);

    // Read markdown content
    let content = '';
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf-8');
    } else {
      console.warn(`⚠️  File not found: ${fileName}`);
    }

    // Check if material already exists for this subject with type THEORY
    const existing = await prisma.subjectMaterial.findFirst({
      where: {
        subjectId: subject.id,
        type: 'THEORY',
      },
    });

    if (existing) {
      console.log(`⏭️  Skip (exists): Topic ${subject.order} — ${subject.name}`);
      skipped++;
      continue;
    }

    await prisma.subjectMaterial.create({
      data: {
        subjectId: subject.id,
        type: 'THEORY',
        title: `📚 Từ vựng & Bài giảng — ${subject.name}`,
        fileUrl: `/content/english/${fileName}`,
        fileName: fileName,
        content: content,
      },
    });

    console.log(`✅ Created: Topic ${subject.order} — ${subject.name}`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
