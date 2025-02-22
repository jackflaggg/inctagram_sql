import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetBlogsQueryParams } from '../../../../blogs/dto/repository/query/get-blogs-query-params.input-dto';
import { getBlogsQuery } from '../../../../../../core/utils/blog/query.insert.blog';
import { BlogViewDto } from '../../../../blogs/dto/repository/query/blog-view.dto';
import { PaginatedBlogViewDto } from '../../../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../../../core/exceptions/incubator-exceptions/domain-exceptions';
import { GetPostsQueryParams } from '../../../dto/api/get-posts-query-params.input.dto';
import { getPostsQuery } from '../../../../../../core/utils/post/query.insert.get';
import { PostViewDto } from '../../../dto/repository/post-view';

@Injectable()
export class PostsPgQueryRepository {
    constructor(@InjectDataSource() protected dataSource: DataSource) {}
    async getAllPosts(queryData: GetPostsQueryParams, userId: string | null, blogId: string) {
        const { pageSize, pageNumber, searchNameTerm, sortBy, sortDirection } = getPostsQuery(queryData);

        const updatedSortBy = sortBy === 'createdAt' ? 'created_at' : sortBy.toLowerCase();

        const offset = (pageNumber - 1) * pageSize;

        const queryPosts = `
            SELECT "id", "name", "description", "website_url" AS "websiteUrl", "created_at" AS "createdAt", "is_membership" AS "isMembership" FROM "posts" WHERE "deleted_at" IS NULL AND ("name" ILIKE '%' || $1 || '%')
            ORDER BY ("${updatedSortBy}") ${sortDirection.toUpperCase()}
            LIMIT $2
            OFFSET $3
            `;

        const resultPosts = await this.dataSource.query(queryPosts, [searchNameTerm, Number(pageSize), Number(offset)]);

        const queryCount = `
            SELECT COUNT(*) AS "totalCount" FROM "blogs" WHERE "deleted_at" IS NULL AND ("name" ILIKE '%' || $1 || '%')
        `;
        const resultTotal = await this.dataSource.query(queryCount, [searchNameTerm]);

        const blogsView = resultPosts.map(blog => BlogViewDto.mapToView(blog));

        return PaginatedBlogViewDto.mapToView<PostViewDto[]>({
            items: blogsView,
            page: pageNumber,
            size: pageSize,
            totalCount: +resultTotal[0].totalCount,
        });
    }
    async getPost(blogId: string) {
        const query = `SELECT "id", "name", "description", "website_url" AS "websiteUrl", "created_at" AS "createdAt", "is_membership" AS "isMembership" FROM "posts" WHERE id = $1 AND "deleted_at" IS NULL`;
        const result = await this.dataSource.query(query, [+blogId]);
        if (!result || result.length === 0) {
            throw NotFoundDomainException.create('блог не найден', 'blogId');
        }
        return BlogViewDto.mapToView(result[0]);
    }
}
