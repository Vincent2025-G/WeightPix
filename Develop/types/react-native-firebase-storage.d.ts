declare module "@react-native-firebase/storage"{
  import {FirebaseApp} from "@react-native-firebase/app"

  export interface Reference {
    path: string;
    fullPath: string;
    putFile(path: string): Promise<any>;
    getDownloadURL(): Promise<string>;
    putString(data: string, format?: 'raw' | 'base64' | 'base64url'): Promise<any>;
    delete(): Promise<void>;
    listAll(): Promise<{items: Reference[], prefixes: Reference[];}>;
  }


  export interface Storage{
    app: FirebaseApp; 
    ref(path: string): Reference
  }

  export default function storage(app?: FirebaseApp): Storage;
}