export const SURVEY_EDIT_MODE_KEY = 'surveyEditMode';

export function enableSurveyEditMode(): void {
  localStorage.setItem(SURVEY_EDIT_MODE_KEY, 'true');
}

export function disableSurveyEditMode(): void {
  localStorage.removeItem(SURVEY_EDIT_MODE_KEY);
}

export function isSurveyEditMode(): boolean {
  return localStorage.getItem(SURVEY_EDIT_MODE_KEY) === 'true';
}
