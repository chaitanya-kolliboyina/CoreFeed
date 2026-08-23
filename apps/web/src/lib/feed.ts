import { prisma } from "@repo/db";
import type { Post, Tag, Source, PostTag } from "@repo/db";

export interface RankedPost extends Post {
  source: Source;
  tags: (PostTag & { tag: Tag })[];
  score: number;
}

export function rankPosts(
  posts: (Post & { source: Source; tags: (PostTag & { tag: Tag })[] })[],
  userInterestTagIds: string[],
  readPostIds: string[],
  followedSourceIds: string[] = []
): RankedPost[] {
  const now = new Date();

  return posts
    .map((post) => {
      let score = 0;

      // 1. Tag relevance (+50 points per matching interest tag)
      const postTagIds = post.tags.map((pt) => pt.tagId);
      const matchingTagsCount = postTagIds.filter((tagId) =>
        userInterestTagIds.includes(tagId)
      ).length;
      score += matchingTagsCount * 50;

      // 2. Company subscription boost (+100 points if following this company/source)
      if (followedSourceIds.includes(post.sourceId)) {
        score += 100;
      }

      // 3. Recency decay (-1 point per hour elapsed)
      const hoursAge = (now.getTime() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60);
      score -= Math.max(0, hoursAge);

      // 4. Read penalty (-100 points for read history)
      if (readPostIds.includes(post.id)) {
        score -= 100;
      }

      return {
        ...post,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export async function logReadAndAwardXP(userId: string, postId: string) {
  // 1. Check if user already read this post
  const existingRead = await prisma.readEvent.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingRead) {
    // Fetch current user details to return
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { success: false, reason: "Already read", user };
  }

  // 2. Fetch user to check XP, Level, and Streak
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const now = new Date();
  const xpGained = 10;
  let newXp = user.xp + xpGained;
  let newLevel = user.level;

  // Level up logic (100 XP per level)
  while (newXp >= newLevel * 100) {
    newXp -= newLevel * 100;
    newLevel += 1;
  }

  // Streak logic
  let newStreak = user.currentStreak;
  if (!user.lastReadDate) {
    newStreak = 1;
  } else {
    const hoursSinceLastRead = (now.getTime() - user.lastReadDate.getTime()) / (1000 * 60 * 60);
    const lastReadLocalDate = new Date(user.lastReadDate).toLocaleDateString();
    const nowLocalDate = now.toLocaleDateString();

    if (lastReadLocalDate !== nowLocalDate) {
      if (hoursSinceLastRead <= 36) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }
  }

  const newLongestStreak = Math.max(newStreak, user.longestStreak);

  // Update user inside a transaction
  return await prisma.$transaction(async (tx) => {
    // Log the read event
    await tx.readEvent.create({
      data: {
        userId,
        postId,
        method: "manual",
        scrollPct: 100,
        dwellSec: 10,
        xpAwarded: xpGained,
      },
    });

    // Log XP event
    await tx.xpEvent.create({
      data: {
        userId,
        amount: xpGained,
        reason: "Read article",
      },
    });

    // Update user stats
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastReadDate: now,
      },
    });

    return { success: true, user: updatedUser };
  });
}
