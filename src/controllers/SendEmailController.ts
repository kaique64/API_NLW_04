/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';
import { SurveyRepository } from '../repositories/SurveyRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UserRepository } from '../repositories/UsersRepository';
import SendEmailService from '../services/SendEmailService';
import { AppError } from '../errors/AppError';

class SendEmailController {
  async execute(req:Request, res:Response) {
    const { email, survey_id } = req.body;

    const usersRepository = getCustomRepository(UserRepository);
    const surveysRepository = getCustomRepository(SurveyRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const userExist = await usersRepository.findOne({ email });

    if (!userExist) {
      throw new AppError('User doesn`t exists');
    }

    const surveyExist = await surveysRepository.findOne({ id: survey_id });

    if (!surveyExist) {
      throw new AppError('The sruvey user doesn`t exist');
    }
    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: { user_id: userExist.id, value: null },
      relations: ['user', 'survey'],
    });

    const variables = {
      name: userExist.name,
      title: surveyExist.title,
      description: surveyExist.description,
      id: '',
      link: process.env.URLMAIL,
    };

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendEmailService.execute(email, surveyExist.title, variables, npsPath);
      return res.json(surveyUserAlreadyExists);
    }

    // Salvar as informações na tabela
    const surveyUser = surveysUsersRepository.create({
      user_id: userExist.id,
      survey_id,
    });
    await surveysUsersRepository.save(surveyUser);

    // Enviar email para usuário
    variables.id = surveyUser.id;

    await SendEmailService.execute(email, surveyExist.title, variables, npsPath);
    return res.json(surveyUser);
  }
}

export { SendEmailController };
