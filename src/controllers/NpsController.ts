/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
/* eslint-disable camelcase */
import { Request, Response } from 'express';
import { getCustomRepository, Not, IsNull } from 'typeorm';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class NpsController {
  async execute(req: Request, res: Response) {
    const { survey_id } = req.params;

    const surveyUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveysUsers = await surveyUsersRepository.find({
      survey_id,
      value: Not(IsNull()),
    });

    const detractors = surveysUsers.filter((survey) => survey.value >= 0 && survey.value <= 6).length;

    const promoters = surveysUsers.filter((survey) => survey.value >= 9 && survey.value <= 10).length;

    const passivo = surveysUsers.filter((survey) => survey.value >= 7 && survey.value <= 8).length;

    const total = surveysUsers.length;

    const calculus = Number((((promoters - detractors) / (total)) * 100).toFixed(2));

    return res.json({
      detractors,
      promoters,
      passivo,
      total,
      nps: calculus,
    });
  }
}

export { NpsController };
