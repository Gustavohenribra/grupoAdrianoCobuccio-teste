import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHomepage(): string {
    return 'Acesse /api para ver a documentação Swagger.';
  }
}
