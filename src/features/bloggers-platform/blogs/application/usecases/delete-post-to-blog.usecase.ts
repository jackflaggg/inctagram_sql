import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgRepository } from '../../infrastructure/postgres/blogs.pg.repository';
import { NotFoundDomainException } from '../../../../../core/exceptions/incubator-exceptions/domain-exceptions';
import { PostsPgRepository } from '../../../posts/infrastructure/postgres/posts.pg.repository';

export class DeletePostToBlogCommand {
    constructor(
        public readonly blogId: string,
        public readonly postId: string,
    ) {}
}

@CommandHandler(DeletePostToBlogCommand)
export class DeletePostToBlogUseCase implements ICommandHandler<DeletePostToBlogCommand> {
    constructor(
        private readonly blogRepository: BlogsPgRepository,
        private readonly postRepository: PostsPgRepository,
    ) {}
    async execute(command: DeletePostToBlogCommand) {
        const blog = await this.blogRepository.findBlogById(command.blogId);

        if (!blog) {
            throw NotFoundDomainException.create('блог не найден', 'blogId');
        }

        const post = await this.postRepository.findPostById(command.postId);

        if (!post) {
            throw NotFoundDomainException.create('пост не найден', 'postId');
        }

        await this.postRepository.deletePost(post.id);
    }
}
