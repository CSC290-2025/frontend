export interface uploadData {
  id: string;
  url: string;
  apartmentId: number;
}

export interface LocationData {
  [key: string]: {
    districts: string[];
    subdistricts: {
      [key: string]: string[];
    };
  };
}

export interface ImageData {
  id: string;
  fileId: string;
  url?: string;
  apartmentId?: number;
}
