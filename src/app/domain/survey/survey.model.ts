export interface SurveyData {
  NUMERO_DOCUMENTO?: string;
  CODIGO_LOCAL?: string;
  FASE?: number;
  TAREA?: number;
  DATOS_JSON?: string;
  ARCHIVO_ACTA?: any;
  ARCHIVO_EVIDENCIA?: any;
  FECHA_MODALIDAD?:string;
  MODALIDAD?: boolean;
  NOMBRE_IMPLEMENTACION?: string;
  FECHA_IMPLEMENTACION?: string;
  REGISTRA_TAREA?: boolean;
  YEAR?: string;
}

export interface SurveyConfiguration{
  NUMERO_DOCUMENTO?: string;
  CODIGO_LOCAL?: string;
  DATOS_JSON?: string;
  //YEAR?: string;
}


export interface SurveyDataInfo{
  NUMERO_DOCUMENTO?: string;
  CODIGO_LOCAL?: string;
  FASE?: number;
  TAREA?: number;
}


export interface ReportEntryData{
  ID_TIPO_INSTITUCION?: number;
  NUMERO_DOCUMENTO?: string
}


export interface ScheduleDateUpdate {
  ID_FASE: number;
  FECHA_INICIO: string | null;
  FECHA_FIN: string | null;
}




