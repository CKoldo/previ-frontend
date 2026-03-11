export interface UserData {
  DRE_ORI?: string;
  UGEL_ORI?: string;
  TIPO_INSTITUCION?: number;
  NUMERO_DOCUMENTO?: string;
}

export interface CommandLike {
  execute: (payload: any) => Promise<any[]>;
}

export interface RawItem {
  NUMERO_DOCUMENTO?: string;
  CODIGO_LOCAL?: string;
  FECHA_MODALIDAD?: string;
  MODALIDAD?: any;
  NOMBRE_IMPLEMENTACION?: string;
  FECHA_IMPLEMENTACION?: string;
  FASE?: number;
  TAREA?: number;
  DRE?: string;
  UGEL?: string;
  NOMBRE_INSTITUCION?: string;
  DATOS_JSON?: string;
}

export interface Item {
  NUMERO_DOCUMENTO: string;
  CODIGO_LOCAL: string;
  FECHA_MODALIDAD: string;
  MODALIDAD: any;
  NOMBRE_IMPLEMENTACION?: string;
  FECHA_IMPLEMENTACION?: string;
  FASE: number;
  TAREA: number;
  DRE: string;
  UGEL: string;
  NOMBRE_INSTITUCION: string;
  DATOS_JSON: any[];
}

export type TareaKey = 'tarea_1'|'tarea_2'|'tarea_3'|'tarea_4'|'tarea_5';

export interface PhaseBucket {
  fase: number;
  tareas: Record<TareaKey, Item[]>;
}

export interface RangoConfig {
  rangos: string[];
  datos: any[];
}

export interface PhaseRangesConfig {
  fase: number;
  tareas: Partial<Record<TareaKey, RangoConfig>>;
}

export interface SheetConf {
  hoja: string;
  rangos: string[];
  datos: any[];
}
