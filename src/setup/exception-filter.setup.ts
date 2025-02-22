import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../core/exceptions/incubator-exceptions/filter/all-exceptions-filter';
import { DomainExceptionsFilter } from '../core/exceptions/incubator-exceptions/filter/domain-exceptions-filter';
import { CoreConfig } from '../core/config/core.config';
import { LoggerService } from '../features/logger/application/logger.service';

export function exceptionFilterSetup(app: INestApplication) {
    //Подключаем наши фильтры. Тут важна последовательность! (сработает справа на лево)
    app.useGlobalFilters(new DomainExceptionsFilter());
}
