export interface SurveyData {
  NUMERO_DOCUMENTO?: string;
  CODIGO_LOCAL?: string;
  FASE?: number;
  TAREA?: number;
  DATOS_JSON?: string;
  ARCHIVO_ACTA?: any;
  ARCHIVO_EVIDENCIA?: any;
  FECHA_MODALIDAD?: string;
  MODALIDAD?: boolean;
  NOMBRE_IMPLEMENTACION?: string;
  FECHA_IMPLEMENTACION?: string;
  REGISTRA_TAREA?: boolean;
  YEAR?: string;
}

export interface SurveyConfiguration {
  NUMERO_DOCUMENTO?: string;
  CODIGO_LOCAL?: string;
  DATOS_JSON?: string;
  //YEAR?: string;
}


export interface SurveyDataInfo {
  NUMERO_DOCUMENTO?: string;
  CODIGO_LOCAL?: string;
  FASE?: number;
  TAREA?: number;
}


export interface ReportEntryData {
  ID_TIPO_INSTITUCION?: number;
  NUMERO_DOCUMENTO?: string
}


export interface ScheduleDateUpdate {
  ID_FASE: number;
  FASE?: string | null;
  ANIO_FASE?: string | number | null;
  YEAR?: string | number | null;
  FECHA_INICIO_FASE?: string | null;
  FECHA_FIN_FASE?: string | null;
  FECHA_INICIO_REPORTE?: string | null;
  FECHA_FIN_REPORTE?: string | null;
  FECHA_INICIO_VALIDACION?: string | null;
  FECHA_FIN_VALIDACION?: string | null;
  ES_ACTIVO_FASE?: boolean | number | null;
  ESTADO_REGISTRO?: boolean | number | null;
  ESTADO_REGISTRO_REPORTE?: boolean | number | null;
  ESTADO_REGISTRO_VALIDACION?: boolean | number | null;
  ES_ACTIVO_REPORTE?: boolean | number | null;
  ES_ACTIVO_VALIDACION?: boolean | number | null;
}

export interface ScheduleDateEntry {
  ID_FASE: number;
  FASE: string | null;
  ANIO_FASE?: string | null;
  YEAR?: string | null;
  FECHA_INICIO_FASE?: string | null;
  FECHA_FIN_FASE?: string | null;
  FECHA_INICIO_REPORTE?: string | null;
  FECHA_FIN_REPORTE?: string | null;
  FECHA_INICIO_VALIDACION?: string | null;
  FECHA_FIN_VALIDACION?: string | null;
  ES_ACTIVO_FASE?: boolean;
  ESTADO_REGISTRO_REPORTE?: boolean;
  ESTADO_REGISTRO_VALIDACION?: boolean;
  ES_ACTIVO_REPORTE?: boolean;
  ES_ACTIVO_VALIDACION?: boolean;
  ESTADO_REGISTRO?: boolean;
}




