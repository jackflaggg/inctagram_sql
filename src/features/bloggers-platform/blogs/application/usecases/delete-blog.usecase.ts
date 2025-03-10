import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgRepository } from '../../infrastructure/postgres/blogs.pg.repository';
import { NotFoundDomainException } from '../../../../../core/exceptions/incubator-exceptions/domain-exceptions';

export class DeleteBlogCommand {
    constructor(public readonly blogId: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
    constructor(private readonly blogRepository: BlogsPgRepository) {}
    async execute(command: DeleteBlogCommand) {
        const blog = await this.blogRepository.findBlogById(command.blogId);

        if (!blog) {
            throw NotFoundDomainException.create('блог не найден', 'blogId');
        }

        await this.blogRepository.deleteBlog(blog);
    }
}
