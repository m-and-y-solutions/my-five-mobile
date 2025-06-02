export interface LoginCredentials {
    email: string;
    password: string;
  }
  
 export  interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    imageData?: FormData;
    birthDate?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    telephone?: string;
    profileImage?: File;
  }