export interface UserData {
  ID_DRE?:           number;
  DRE?:              string;
  ID_UGEL?:          string;
  UGEL?:             string;
  CODIGO_LOCAL?:     string;
  NOMBRE_IE?:        string;
  NUMERO_DOCUMENTO?: string;
  DATOS_JSON?: any;
  REGISTRADO?:     boolean;
}
export interface SignIn {
  NUMERO_DOCUMENTO:string;
  CODIGO_LOCAL?:string
}


export interface SignInDREUGEL {
  ID_TIPO_INSTITUCION?:number; // 2=UGEL, 3=DRE
  NUMERO_DOCUMENTO:string;
}

export interface UserTrack {
  ID_DRE?:       string;
  DRE?:          string;
  ID_UGEL?:      string;
  UGEL?:         string;
  CODIGO_LOCAL?: string;
  NOMBRE_IE?:    string;
  FASE1_TAREA1?: number;
  FASE1_TAREA2?: number;
  FASE1_TAREA3?: number;
  FASE1_TAREA4?: number;
}

