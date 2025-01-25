import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/pokeResponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
@Injectable()
export class SeedService {
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly PokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter 
  ) {}
  async executeSeed() {
    await this.PokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    // const insertPromisesArray = []; Forma 1 de insertar el seed
    const ArraySeed: { name: string; no: number }[] = []; //Forma 2 de insertar el seed y optimizada

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // this.PokemonModel.create({name,no});
      // insertPromisesArray.push(this.PokemonModel.create({ name, no }));  Forma 1 de insertar el seed
      ArraySeed.push({ name: name, no: no}) //Forma 2 de insertar el seed y optimizada
    });

    await this.PokemonModel.insertMany(ArraySeed) //Forma 2 de insertar el seed y optimizada
    // await Promise.all(insertPromisesArray); Forma 1 de insertar el seed
    return `seed ejecutado`;
  }
}
