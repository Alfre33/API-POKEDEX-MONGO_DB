import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pokemon, PokemonSchema } from './entities/pokemon.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [PokemonController],
  providers: [PokemonService],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([ //Forma de asociar el entity y esquema a la base de datos de docker
      {
        name: Pokemon.name,
        schema: PokemonSchema,
      },
    ]),
  ],
  exports:[MongooseModule]
})
export class PokemonModule {}
