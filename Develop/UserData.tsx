import { createContext, useState, ReactNode, useContext} from "react";
import { imageDataType } from "./StackList";
import DeviceInfo from 'react-native-device-info'

interface UserDataType{
    imageData: imageDataType[] | null,
    allowedAccess: null | boolean,
    goalWeight: string | null,
    unit: string | null,
    dataLength: number | null,
    deviceName: string,
    globalStoredData: imageDataType[],
    validSubscription: boolean | null,
    completedOnboard: boolean | null,
    setGoalWeight: (data: string | null) => void,
    setUnit: (data: string | null) => void,
    setImageData: (data: imageDataType[] | null) => void,
    setAllowedAccess: (data: null | boolean ) => void,
    setDataLength: (data: number | null) => void,
    setDeviceName: (data: string) => void,
    setValidSubscription: (data: boolean | null) => void,
    setGlobalStoredData: React.Dispatch<React.SetStateAction<imageDataType[]>>;
    setCompletedOnboard: (data: boolean | null) => void
}
  
export const UserData = createContext<UserDataType>({
    imageData: null,
    setImageData: () => {},
    allowedAccess: null,
    setAllowedAccess: () => {},
    goalWeight: null, 
    setGoalWeight: () => {},
    unit: null, 
    setUnit: () => {},
    dataLength: null, 
    setDataLength: () => {}, 
    deviceName: '', 
    setDeviceName: () => {},
    globalStoredData: [], 
    setGlobalStoredData: () => {},
    validSubscription: null,
    setValidSubscription: () => {},
    completedOnboard: null, 
    setCompletedOnboard: () => {}
});

  interface UserDataProviderProps {
    children: ReactNode;
  }


export const UserDataProvider = ({children}: UserDataProviderProps) =>{
    const [imageData, setImageData] = useState<imageDataType[] | null>(null);
    const [allowedAccess, setAllowedAccess] = useState<null | boolean>(null);
    const [goalWeight, setGoalWeight] =  useState<string | null>(null);
    const [unit, setUnit] = useState<string | null>('lb');
    const [dataLength, setDataLength] = useState<number | null>(null);
    const [deviceName, setDeviceName] = useState<string>('');
    const [globalStoredData, setGlobalStoredData] = useState<imageDataType[]>([]);
    const [validSubscription, setValidSubscription] = useState<boolean | null>(null);
    const [completedOnboard, setCompletedOnboard] = useState<boolean | null>(null);
    
    return (
        <UserData.Provider value={{imageData, allowedAccess, goalWeight, unit, dataLength, deviceName, globalStoredData, validSubscription, completedOnboard, setGoalWeight, setUnit, setImageData, setAllowedAccess, setDataLength, setDeviceName, setGlobalStoredData, setValidSubscription, setCompletedOnboard}}>
        {children}
        </UserData.Provider>
    );
}