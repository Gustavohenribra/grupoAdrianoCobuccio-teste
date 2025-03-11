import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  getHomepage(): string {
    return 'Acesse /api para ver a documentação Swagger.';
  }
}
