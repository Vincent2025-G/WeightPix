
// Gives the type for the image object.
export type imageDataType = {
  selfie: string | null,
  fullBody: string | null, 
  weight: string,
  date: string,
  notes: string, 
  selfieName: string | undefined, 
  fullBodyName: string | undefined,
  // oldDirectoryPath: string
}

// Creates the RootStack types for the different screens
export type RootStackParamList = {
    Home: undefined | {uid?:string },
    Data: {imageData: imageDataType[] | null},
    ChartPage: {imageData: imageDataType[] | null},
    Login: undefined,
    SignUp: undefined,
    Onboard1: undefined, 
    Onboard2: undefined,
    Payment: undefined
    }
  