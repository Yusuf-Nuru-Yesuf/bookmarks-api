import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { Bookmark } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
@Injectable()
export class BookmarkService {
  constructor(private drizzle: DrizzleService) {}
  getBookmarks(userId: string) {
    return this.drizzle.client.query.Bookmark.findMany({
      where: (Bookmark, { eq }) => eq(Bookmark.userId, userId),
    });
  }

  getBookmarkById(userId: string, bookmarkId: string) {
    return this.drizzle.client.query.Bookmark.findFirst({
      where: (Bookmark, { eq, and }) =>
        and(eq(Bookmark.userId, userId), eq(Bookmark.id, bookmarkId)),
    });
  }

  async createBookmark(userId: string, dto: CreateBookmarkDto) {
    const bookmark = await this.drizzle.client
      .insert(Bookmark)
      .values({ userId, ...dto })
      .returning();

    return bookmark;
  }

  async editBookmarkById(
    userId: string,
    bookmarkId: string,
    dto: EditBookmarkDto,
  ) {
    // get the bookmark by id
    const bookmark = await this.drizzle.client.query.Bookmark.findFirst({
      where: (Bookmark, { eq }) => eq(Bookmark.id, bookmarkId),
    });

    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied ');
    }

    if (dto.link && typeof dto.link !== 'string') {
      dto.link = String(dto.link);
    }

    console.log(dto);

    return this.drizzle.client
      .update(Bookmark)
      .set(dto)
      .where(eq(Bookmark.id, bookmarkId))
      .returning();
  }

  async deleteBookmarkById(userId: string, bookmarkId: string) {
    const bookmark = await this.drizzle.client.query.Bookmark.findFirst({
      where: (Bookmark, { eq }) => eq(Bookmark.id, bookmarkId),
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    await this.drizzle.client
      .delete(Bookmark)
      .where(eq(Bookmark.id, bookmarkId));
  }
}
