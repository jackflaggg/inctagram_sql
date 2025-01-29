import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/user/user.repository';
import { PasswordRecoveryDbRepository } from '../../../infrastructure/password/password.recovery.repository';
import { BadRequestDomainException, NotFoundDomainException } from '../../../../../core/exceptions/incubator-exceptions/domain-exceptions';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns/add';
import { EmailService } from '../../../../notifications/application/mail.service';

export class RegistrationEmailResendUserCommand {
    constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendUserCommand)
export class RegistrationEmailResendUserUseCase implements ICommandHandler<RegistrationEmailResendUserCommand> {
    constructor(
        @Inject() private readonly usersRepository: UserRepository,
        private readonly mailer: EmailService,
        @Inject() private readonly passwordRepository: PasswordRecoveryDbRepository,
    ) {}
    async execute(command: RegistrationEmailResendUserCommand) {
        const user = await this.usersRepository.findUserByLoginOrEmail(command.email);

        if (!user) {
            throw BadRequestDomainException.create('юзер не найден', 'usersRepository');
        }

        if (user.emailConfirmation.isConfirmed) {
            throw BadRequestDomainException.create('аккаунт уже был активирован', 'RegistrationEmailResendUserUseCase');
        }
        const generateCode = randomUUID();

        const newExpirationDate = add(new Date(), {
            hours: 1,
            minutes: 30,
        });
        await this.usersRepository.updateUserToCodeAndDate(user._id.toString(), generateCode, newExpirationDate);

        this.mailer.sendEmailRecoveryMessage(user.email, generateCode).catch(async (err: unknown) => {
            console.log(String(err));
        });
    }
}
