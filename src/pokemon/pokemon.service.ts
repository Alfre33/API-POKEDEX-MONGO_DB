import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly PokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLowerCase();
      const pokemondb = await this.PokemonModel.create(createPokemonDto);

      return pokemondb;
    } catch (error) {
      this.managerErrors(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(+term)) {
      pokemon = await this.PokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.PokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.PokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id,name or no "${term}" not found`,
      );
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id,name or no "${term}" not found`,
      );
    }
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, {
        new: true,
      });

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.managerErrors(error);
    }
  }

  async remove(id: string) {
    // try {
    //   if (!isNaN(+term)) {
    //     await this.PokemonModel.findOneAndDelete({ no: term });
    //   }
    //   if (isValidObjectId(term)) {
    //     await this.PokemonModel.findByIdAndDelete(term);
    //   } else {
    //     await this.PokemonModel.findOneAndDelete({ name: term });
    //   }
    //   return `Pokemon with no or name ${term} has deleted`;
    // } catch (error) {
    //   console.log({error})
    // }

    const { deletedCount } = await this.PokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
    return `Pokemon with id ${id} has deleted`;
  }

  private managerErrors(error: any) {
    if (error.code === 11000) {
      let key = Object.keys(error.keyValue)[0];
      let str = `${key}:${error.keyValue[key]}`;
      throw new BadRequestException(
        `Pokemon ${str} already exists in the database change your -- ${key.toLocaleUpperCase()} -- the pokemon`,
      );
    }
    throw new InternalServerErrorException(
      `Can't create Pokemon -- Check server logs`,
    );
  }
}
