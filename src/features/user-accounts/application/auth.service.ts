import { UnauthorizedDomainException } from '../../../core/exceptions/incubator-exceptions/domain-exceptions';
import { Inject, Injectable } from '@nestjs/common';
import { UserDocument } from '../domain/user/user.entity';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRepository } from '../infrastructure/user.repository';

export class UserLoggedInEvent {
    constructor(public readonly userId: string) {}
}

@Injectable()
export class AuthService {
    constructor(
        @Inject() private readonly usersRepository: UserRepository,
        private readonly eventBus: EventBus, // Внедрение EventBus
    ) {}

    async validateUser(payload: any): Promise<UserDocument> {
        const user = await this.usersRepository.findUserByLoginOrEmail(payload);
        if (!user) {
            throw UnauthorizedDomainException.create();
        }

        // Генерация события при успешной аутентификации
        this.eventBus.publish(new UserLoggedInEvent(user._id.toString()));

        return user;
    }
}

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInEventHandler implements IEventHandler<UserLoggedInEvent> {
    handle(event: UserLoggedInEvent) {
        console.log(`User ${event.userId} has logged in.`);
        // Здесь вы можете выполнить дополнительные действия, такие как логирование,
        // обновление статистики, отправка уведомлений и т.д.
    }
}
