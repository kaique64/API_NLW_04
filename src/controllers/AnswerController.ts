import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { AppError } from '../errors/AppError';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class AnswerController {
  async execute(req: Request, res: Response) {
    const { value } = req.params;
    const { u } = req.query;

    const surveyUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveyUser = await surveyUsersRepository.findOne({
      id: String(u),
    });

    if (!surveyUser) {
      throw new AppError('The sruvey user doesn`t exist');
    }

    surveyUser.value = Number(value);

    await surveyUsersRepository.save(surveyUser);

    return res.json(surveyUser);
  }
}

export { AnswerController };
