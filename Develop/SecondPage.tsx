import React, {useState, useRef, useEffect, useContext} from 'react';
import type {PropsWithChildren} from 'react';
import { NavigationContainer, createStaticNavigation, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList } from './StackList';
import { imageDataType } from './StackList';
import {firestore} from './Firebase'
import {collection, doc, getDoc, Timestamp, updateDoc} from '@react-native-firebase/firestore'
// import firebase from "@react-native-firebase/app";
import { GlobalState } from './GlobalState';
import { UserData } from './UserData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  PushNotificationIOS  from '@react-native-community/push-notification-ios';
import {format} from 'date-fns'
import * as RNFS from '@dr.pogodin/react-native-fs';
// import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image'
import {Gesture, GestureDetector, State} from 'react-native-gesture-handler'
import Animated, {useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming} from 'react-native-reanimated'
import {useCheckSubscriptionInfo} from './subscriptionCheck';


import {
 ScrollView,
 StatusBar,
 StyleSheet,
 Text,
 TextInput,
 TextInput as RNTextInput,
 useColorScheme,
 View,
 FlatList,
 SectionList,
 Image,
 ImageBackground,
 TouchableWithoutFeedback,
 Keyboard,
 TouchableOpacity,
 InteractionManager,
 DevSettings,
 ImageResolvedAssetSource,
 Alert,
 ActivityIndicator,
 Pressable,
ViewToken

} from 'react-native';

// import { PinchGesture } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/pinchGesture';






 const styles = StyleSheet.create({
   pageContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: 'black',
  
   },
   imagesContainer: {
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: 'black',
     borderColor: '#00ffff',
     borderRadius: 5,
     borderWidth: 1,
     margin: 10,
     marginTop: 20,
     shadowOffset: {width: 0, height: 0},
     shadowRadius: 7,
     shadowOpacity: 10,
     shadowColor: '#00ffff'
    //  marginLeft: 20
   },
   textContainer:{
     flexDirection: 'column',     
   },
   navigationContainer:{
     width: '100%',
     flexDirection: 'row',
     position: 'absolute',
     bottom: 25,

     gap: 225,
     left: 10
   },
   navigationButtonContainer:{
     marginLeft: 35
   },
   searchContainer:{
     borderWidth: 1,
     borderColor: '#00ffff',
     borderRadius: 20,
     padding: 6,
     alignSelf: 'center',
     backgroundColor: 'black',
     flexDirection: 'row',
     marginTop: 80
   },
   notePad:{
     width: 300,
     height: 400,
     flex:1,
     position: 'absolute',
     left: '13%',
     top: '30%',
     backgroundColor: 'black',
     borderRadius: 15,
     paddingTop: 25,
     color: 'white',
     borderWidth: 3,
     borderColor: '#00ffff',
     overflow: 'hidden',
     zIndex: 100
   },
   searchBar:{
     borderWidth: 1,
     borderColor: '#00ffff',
     borderRadius: 20,
     padding: 6,
     alignSelf: 'center',
     flexDirection: 'row',
     width: 200
   },
   image:{
     width: 220,
     height: 220,
     marginTop: '0%',
     borderRadius: 5,
     justifyContent: 'center',
     alignItems: 'center',  
    // borderColor: '#00ffff',
    // borderWidth: 2
   },
   imageLoading:{
    opacity: 0,
     width: 220,
     height: 220,
     marginTop: '0%',
     borderRadius: 5,
     justifyContent: 'center',
     alignItems: 'center'  
    
   },
   bigImageLoading1:{
    // opacity: 0,
    width: 350,
    height: 350,
     marginTop: '0%',
     borderRadius: 5,
     justifyContent: 'center',
     alignItems: 'center'  
    
   },
   bigImageLoading2:{
    // opacity: 0,
      width: 350,
      height: 350,
     marginTop: '0%',
     borderRadius: 5,
     justifyContent: 'center',
     alignItems: 'center', 
     borderWidth: 1,
     borderColor: '#00ffff',
     shadowOffset: {width: 0, height: 0},
     shadowRadius: 8,
     shadowOpacity: 10,
     shadowColor: '#00ffff'
    
   },
   bigImage1:{
     width: 350,
     height: 350,
     borderRadius: 5,
   },
   bigImage2:{
    width: 350,
    height: 350,
     marginTop: '5%',
     marginBottom: '5%',
     borderRadius: 5,
     borderWidth: 3,
     borderColor: '#00ffff',
     shadowOffset: {width: 0, height: 0},
     shadowRadius: 40,
     shadowOpacity: 1,
     shadowColor: '#00ffff',
    //  zIndex: 99
   },
   text: {
       fontSize: 25,
       color: 'white',
       fontWeight: 'bold',
       textShadowColor: '#00ffff',
       textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
       textShadowRadius: 2, // Controls how far the shadow blurs out.
   },
   largerText: {
       fontSize: 35,
       color: 'white',
       fontWeight: 'bold',
       textShadowColor: '#00ffff',
       textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
       textShadowRadius: 2, // Controls how far the shadow blurs out.
      //  zIndex: 1
   },
   smallerText: {
       fontSize: 17,
       color: 'white',
       fontWeight: 'bold',
       textShadowColor: '#00ffff',
       textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
       textShadowRadius: 2, // Controls how far the shadow blurs out.
   },
   weightText: {
       fontSize: 25,
       color: 'white',
       fontWeight: 'bold',
       textShadowColor: '#00ffff',
       textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
       textShadowRadius: 2,
       textDecorationColor: 'underline', // Controls how far the shadow blurs out.
   },
   dateText: {
       fontSize: 25,
       color: 'white',
       fontWeight: 'bold',
       textShadowColor: '#00ffff',
       textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
       textShadowRadius: 2, // Controls how far the shadow blurs out.
       marginLeft: 20
   },
   largeDateText: {
       fontSize: 35,
       color: 'white',
       fontWeight: 'bold',
       textShadowColor: '#00ffff',
       textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
       textShadowRadius: 2, // Controls how far the shadow blurs out.
       marginLeft: 20
   },
   textInputText:{
     fontSize: 23,
     color: 'white',
     fontWeight: 'bold',
     textShadowColor: '#00ffff',
     textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
     textShadowRadius: 2, // Controls how far the shadow blurs out.
     textAlign: 'center'
   },
   textInputTextMM:{
     fontSize: 23,
     color: 'white',
     fontWeight: 'bold',
     textShadowColor: '#00ffff',
     textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
     textShadowRadius: 2, // Controls how far the shadow blurs out.
     textAlign: 'center',
    //  borderWidth: 1,
    //  borderColor: 'white',
     width: 38,
     marginRight: 3
   },
   textInputTextYY:{
     fontSize: 23,
     color: 'white',
     fontWeight: 'bold',
     textShadowColor: '#00ffff',
     textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
     textShadowRadius: 2, // Controls how far the shadow blurs out.
     textAlign: 'center',
     width: 38
    //  borderWidth: 1,
    //  borderColor: 'white'
   },
   okButton1:{
 
     opacity: 1,
     alignItems: 'center',
     backgroundColor: 'grey',
     marginLeft: 5,
     borderRadius: 20,
     width: 40
   },
   okButton2:{
 
     opacity: 0,
     alignItems: 'center',
     backgroundColor: 'grey',
     marginLeft: 5,
     borderRadius: 20,
     width: 40
   },
   exitButton1:{
    position: 'absolute',
    left: 40,
    top: 85,
    opacity: 1,
    alignItems: 'center',
    backgroundColor: 'grey',
    marginLeft: 5,
    borderRadius: 20,
    width: 40,
   },
   exitButton2:{
     position: 'absolute',
     right: 0,
     top: 8,
     opacity: 0,
     alignItems: 'center',
     backgroundColor: 'grey',
     marginLeft: 5,
     borderRadius: 20,
     width: 40
   },
   navigationButton:{
     borderColor: '#00ffff',
     borderWidth: 2,
     borderRadius: 5,
     width: 40
   },
   rangeButton1:{
     borderColor: '#00ffff',
     borderWidth: 2,
     borderRadius: 5,
     width: 40,
     position: 'absolute',
     right: 45,
     top: 85,
     alignItems: 'center'
   },
   rangeButton2:{
     borderColor: '#00ffff',
     borderWidth: 2,
     borderRadius: 5,
     width: 40,
     position: 'absolute',
     right: 45,
     top: 85,
     alignItems: 'center',
     shadowColor: '#00ffff',
     shadowOffset: {width: 0, height: 0},
     shadowRadius: 8,
     shadowOpacity: 1
   },
 });


type Prop = NativeStackScreenProps<RootStackParamList, "Data">


export const SecondPage = ({navigation, route}: Prop): React.JSX.Element => {
  // navigation.navigate("Login")  
   
  // console.log("UID: " + GlobalState.uid) 
 
  const imageRoute = route.params ?? {};

  const {imageData, setImageData, allowedAccess, setAllowedAccess, setUnit, unit, validSubscription} = useContext(UserData);
  // console.log("This is the device name: " + deviceName);
  const [localHasData, setlocalHasData] = useState<boolean | null>(null);
  const checkedDatabase = useRef(false);
  const triedToRetrieveLocally = useRef(false);
  const userDir = `${RNFS.DocumentDirectoryPath}/${GlobalState.uid}`;
  const subInfoPath = `${userDir}/subInfo`;
  const objPath = `${userDir}/images.json`;
  const urlPath = `${userDir}/urls.json`;
  const changedDataPath = `${userDir}/changeddata.json`;
  // const urlPath = `${userDir}/urls.json`;
  const updatedPath = RNFS.DocumentDirectoryPath.split('/')[6];
  const [alreadyHasData, setAlreadyHasData] = useState(false);
  const [storingDone, setStoringDone] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState(false);
  
  const {checkLocal} = useCheckSubscriptionInfo();
  

  const dataExists = useRef<boolean | null>(null);
  const convertToLocalCalled = useRef(false);

useEffect(() => {
  const checkSubscription = async () => {
    checkLocal(subInfoPath, imageData?.length ?? 0);
  }

  checkSubscription();
}, [])
 


 
useEffect(() => { 
  
  const convertToLocal = async () => 
  {
    let newImageData: imageDataType[] = [];
    const res = await RNFS.readDir(userDir);
    let paths = res.map((item) => item.path);
    paths = paths.filter(item => item.includes(".jpg")); 
    console.log("length: " + paths.length);
    if(imageData != null && imageData.length > 0 && (paths.length === (imageData.length * 2)) && imageData![imageData.length - 1].selfie?.includes("http")){
      console.log("Entered because equal lengths " + paths.length + " " + imageData.length);
      for(const image of imageData!){
        // if(image.selfie?.includes("http")){   
          console.log("Entered for: " + image.selfie)     
          const restoredSelfiePath = paths.filter((item) => item.includes(image.selfieName!)); 
          const restoredFullBodyPath = paths.filter((item) => item.includes(image.fullBodyName!));
          const newImageObj: imageDataType =  {selfie: restoredSelfiePath[0], fullBody: restoredFullBodyPath[0], weight: image.weight, date: image.date, notes: image.notes, selfieName: image.selfieName, fullBodyName: image.fullBodyName}
          newImageData = [...newImageData, newImageObj];
        // }
      }

      // Adding the new image set to the newImageData so when you overwrite
      // it will contain it.
      // if(globalStoredData.length === 1 && newImageData.length != imageData!.length){
      //   newImageData = [...newImageData, ...globalStoredData];
      // }

      // console.log("Here's the new image data dawg: " + newImageData);

      if(newImageData.length >= imageData.length){
        console.log("Changed the data!");
        setImageData(newImageData);
        setFiltered(newImageData);
        await RNFS.writeFile(objPath, JSON.stringify(newImageData), 'utf8');
      }
    }
  }

    convertToLocal();
  
 }, [storingDone, imageData])




  const checkIfInStorage = async (currPath: string): Promise<boolean> => 
  {
    
      const res = await RNFS.readDir(userDir);
      const paths = res.map((item) => item.path);
      // console.log("These are the paths " + paths);

      let check = false;

      for(const path of paths){
        if(path.includes(currPath)){
          check = true;
          break;
        }
      }

      return check;
  }

  
  
  const restoreLocalData = async () => {
    
    if(!triedToRetrieveLocally.current){
      triedToRetrieveLocally.current = true;
    try{ 
      
      console.log("Current object path: " + objPath);

      const storedImageData = await RNFS.readFile(`${objPath}`, 'utf8');
      const storedImageObj = JSON.parse(storedImageData);
      
      console.log("Stored Image Data in restore: " + storedImageData);

      setlocalHasData(true);
      let newImageData: imageDataType[] = [];

      // Reconstructing the new paths for the images 
      // so that they can be read.
      let index = 1;
      for(const item of storedImageObj){
        const oldSelfiePath = item.selfie.split(item.selfie.split('/')[7]);
        const oldFullBodyPath = item.fullBody.split(item.fullBody.split('/')[7]);

        console.log("# " + index +  " Old selfie path: " + oldSelfiePath); 
        console.log("# " + index +  " Old full body path: " + oldFullBodyPath); 

        item.selfie = oldSelfiePath.join(RNFS.DocumentDirectoryPath.split("/")[6]);
        item.fullBody = oldFullBodyPath.join(RNFS.DocumentDirectoryPath.split("/")[6]);
        console.log("This is the new part");
        console.log("New Selfie path: " + item.selfie);
        console.log("New Selfie path: " + item.fullBody);

        newImageData = [...newImageData, item];
        index++;
      }

      console.log("Success: New image data: " + newImageData[0].selfie); 


      setImageData(newImageData);

      await RNFS.writeFile(objPath, JSON.stringify(newImageData), 'utf8');
      
    }
      catch(error){
        setlocalHasData(false);
        console.log("Error with RNFS: " + error);
      }
    }
  }

   
   

  const storeAsyncData = async (inputData: imageDataType[]) => {
    console.log("store async data entered" + " " + inputData.length);
    let newImageData: imageDataType[] = [];

    let exists = await RNFS.exists(userDir);
    if(!exists){
       dataExists.current = false;
       RNFS.mkdir(userDir);
    }
    else{
      console.log("This is the path that exists")
      dataExists.current = true;
    }
   

    exists = await RNFS.exists(userDir);
    console.log("This is exists after making the directory should work: " + exists);
    
      for(const item of inputData){

       const localSelfiePath = `${userDir}/${item.selfieName}`; 
       const localFullBodyPath = `${userDir}/${item.fullBodyName}`; 

       const alreadyCalledSelfie = await checkIfInStorage(localSelfiePath);
      //  const alreadyCalledFullBody = await checkIfInStorage(localFullBodyPath);
       if(alreadyCalledSelfie){
        console.log("Already called, move on to the next!");
        continue; 
       }

       console.log("Made it after the paths selfie: " + localSelfiePath + " localFullbody: " + localFullBodyPath);
      try{
       const[selfieResult, fullBodyResult] = await Promise.all([
        RNFS.downloadFile({fromUrl: item.selfie!, toFile: localSelfiePath}).promise,
        RNFS.downloadFile({fromUrl: item.fullBody!, toFile: localFullBodyPath}).promise
      ]);
      console.log("Selfie status " + selfieResult.statusCode + " " + "full body status " + fullBodyResult.statusCode);
    }
    catch(error){
      console.log("Error: " + error);
    } 
      const exists = await RNFS.exists(userDir);
      if(exists){
        console.log("Path exists");
      }
      else{
        console.log("Path doesn't exist");
      }
      
      const files = await RNFS.readDir(userDir);

      const localStorageData = files.map(file => ({
        name: file.name,
        path: file.path,
      }));

    const selfieData = localStorageData.filter(localItem =>
        localItem.name === item.selfieName
    );

    // Getting the full body path.
    const fullBodyData = localStorageData.filter(localItem =>
      localItem.name === item.fullBodyName
    );

    const newObj:imageDataType = {selfie: selfieData[0].path, fullBody: fullBodyData[0].path, weight: item.weight, date: item.date, notes: item.notes, selfieName: item.selfieName, fullBodyName: item.fullBodyName}
    newImageData = [...newImageData, newObj];
 
    console.log("This is localstorage length " + localStorageData.length);

       
    }

    setImageData(newImageData);
    // setFiltered(newImageData);
    setStoringDone(true);
    
    console.log("The storing is done!");

      // if(newImageData.length > 0){
      //     setGlobalStoredData(prev => [...prev, ...newImageData]);
      // }

      

  }

  useEffect(() => {
    
    setFiltered(imageData!);
  }, [imageData])
  
 

  useEffect(() => {
    const setData = async () => {
      const storedData = await RNFS.readFile(changedDataPath, 'utf8');
      if(storedData != null){
         const parsedData = JSON.parse(storedData);
          console.log("entered storeData Unit: " + parsedData.unit + " GoalWeight: " + parsedData.weight)
         setUnit(parsedData.unit);
      }
    }

    setData();
  }, [])


 
  useEffect(() => {
    const setImages = async () => {
      
     try{ 

      const exists = await RNFS.exists(userDir);
      if(!exists){
        console.log("Directory doesn't exist");
        restoreLocalData();
        return;
      } 
      else{
        setlocalHasData(true);
        dataExists.current = true;
      }

      // Getting the images from the local path
      const storedImageData = await RNFS.readFile(objPath, 'utf8');
      const storedImageObj = JSON.parse(storedImageData);

      console.log("stored image obj: " + storedImageObj.length)

      if((imageData != null && exists && imageData.length > storedImageObj.length)){
        console.log("Image Data larger! " + imageData.length);
        return;
      }
   
      console.log("Actually Worked")
      setStoringDone(true);
      
      setImageData(storedImageObj);
      console.log("The image data in RNFS")
      for(const item of storedImageObj){
        console.log(item)
      }
    
    }
      catch(error){
        restoreLocalData();
        console.log("Error with RNFS: " + error);
      }
    }

    setImages();
  }, [storingDone, loadError])

  useEffect(() =>{
    const checkIfDifference = async () => {
      console.log("Calling checker")
      console.log("Data Length: " + GlobalState.dataLength +  "imageData length: " + imageData!.length);

       if( imageData != null && GlobalState.dataLength! > imageData!.length && localHasData == true){
        console.log("There is a difference:")
        const dbCollection = collection(firestore, 'Users');
        const docRef = doc(dbCollection, GlobalState.uid);
        const docSnap = await getDoc(docRef);
       //  await doc(dbCollection, GlobalState.uid).update({[deviceName]: RNFS.DocumentDirectoryPath.split('/')[6]});
 
      if(docSnap.exists()){
       const user = docSnap.data() as UserDataTypes;
       const photos = user?.photos; 
       let newImageData: imageDataType[] = [];

       for(let i = imageData.length; i < GlobalState.dataLength; i++){
          newImageData = [...newImageData, photos[i]];
       }

      // let combinedData = [...imageData, newImageData]

        console.log("This is the difference image data: " + newImageData.length);
        setAlreadyHasData(true);
        await storeAsyncData(newImageData);
       }
    }
  }

    checkIfDifference();
  
}, [localHasData])

 
 const [lastIndex, setLastIndex] = useState(0);
 
 interface UserDataTypes{
  photos: imageDataType[],
  endTime: Timestamp, 
  unit: string, 
  oldDirectoryPath: string,
  [key: string]: any,
  globalStoredData: imageDataType[],
  
}


  useEffect(() =>
  {

    
    // if(imageRoute.imageData != null && imageData != null && imageRoute.imageData.length > imageData!.length){
    //     console.log("Entered here messing things up!");
    //     setImageData(imageRoute.imageData);
    //     setFiltered(imageRoute.imageData);
    //     setDataChanged(data => !data);
    //     return;
       
    // }

    if(localHasData === false && !checkedDatabase.current){ 
      checkedDatabase.current = true;
      console.log("Data retrieved again!" + " image data " + imageData + " allowedAccess: " + allowedAccess + " asyncHasData: " + localHasData);
    const getData = async () => {
     try{
       const dbCollection = collection(firestore, 'Users');
       const docRef = doc(dbCollection, GlobalState.uid);
       const docSnap = await getDoc(docRef);
      //  await doc(dbCollection, GlobalState.uid).update({[deviceName]: RNFS.DocumentDirectoryPath.split('/')[6]});

     if(docSnap.exists()){
      const user = docSnap.data() as UserDataTypes;
      setImageData(user?.photos as imageDataType[]);
      setAlreadyHasData(false)
      await storeAsyncData(user?.photos as imageDataType[]);
      
      setDataLoaded(true);
      setDataChanged(data => !data)

      setTimeout(() => {
       setLastIndex(user?.photos.length - 1);
     }, 100)

     await RNFS.writeFile(objPath, JSON.stringify(user?.photos as imageDataType[]), 'utf8');
     }
    //  else if(docSnap.exists() && newImageAdded){
    //       const user = docSnap.data() as UserDataTypes;
    //       const photos = user?.photos as imageDataType[]
    //       setAlreadyHasData(false)
    //       await storeAsyncData(user?.photos as imageDataType[]);
          
    //       setDataLoaded(true);
    //       setDataChanged(data => !data)

    //       setTimeout(() => {
    //       setLastIndex(user?.photos.length - 1);
    //     }, 100)

    //     await RNFS.writeFile(objPath, JSON.stringify(user?.photos as imageDataType[]), 'utf8');
    //  }
     else{
      console.log("User not found!");
     }
   }
   catch(error){
     console.log("Couldn't fetch user data" + error)
   }
  }
  getData();
}
  }, [localHasData, imageData]);

  useEffect(() => {
    if(imageData !== null){
      setDataLoaded(true);
    }
  }, [])


 useEffect(() => {
  if(allowedAccess === null){
   const checkTime = async () => {
     try{
       const dbCollection = collection(firestore, 'Users');
       const docRef = doc(dbCollection, GlobalState.uid);
       const docSnap = await getDoc(docRef);
       if(docSnap.exists()){
         const data = docSnap.data() as UserDataTypes;
         if(data?.endTime instanceof Timestamp){
           const end = data?.endTime.toDate().getTime()
           updateTime(end)
         }
         if(data.photos.length != 0 && data.photos[data.photos.length - 1].date){

         }
       }
     }
     catch(error){
       console.log("Error: " + error);
     }
   }
   checkTime();
  }
 }, [imageData, localHasData]);  


 const updateTime = (end: number) => {
   let lastAllowed: boolean | null = null;
   const interval = setInterval(() => {
         const now = Date.now();
         const diff = Math.max(0, Math.floor((end - now) / 1000));
        
         // console.log("This is the time now " + diff)
         if(diff === 0){   
          
           if(lastAllowed !== true){
             setAllowedAccess(true);         
             lastAllowed = true;
           }
          
           clearInterval(interval);
          
         }
         else{
           // Making sure to only render once if the person isn't allowed
           // access yet.
           if(lastAllowed !== false){
             setAllowedAccess(false);
             lastAllowed = false;
           }
         } 
       }, 1000)
   }

   


  


  const [selfieSelected, setSelfieSelected] = useState(false);
  const [fullBodySelected, setFullBodySelected] = useState(false);
  const [currImage, setCurrImage] = useState<imageDataType | null>();
  const [currIndex, setCurrIndex] = useState(0);
  let selfieLoadedList = useRef<boolean[]>(Array(imageData?.length).fill(false));
  let bigSelfieLoadedList = useRef<boolean[]>(Array(imageData?.length).fill(false));
  let fullBodyLoadedList = useRef<boolean[]>(Array(imageData?.length).fill(false));
  let bigFullBodyLoadedList = useRef<boolean[]>(Array(imageData?.length).fill(false));

  const [search, setSearch] = useState('');
  const [weight, setWeight] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [endWeight, setEndWeight] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [month1, setMonth1] = useState('');
  const [month2, setMonth2] = useState('');
  const [year, setYear] = useState('');
  const [year1, setYear1] = useState('');
  const [year2, setYear2] = useState('');
  const [weightSearch, setWeightSearch] = useState(false);
  const [dateSearch, setDateSearch] = useState(false);
  
  const [keyboardShow, setKeyboardShow] = useState(false);
  const [validSearch, setValidSearch] = useState(true);
  const [rangeSelected, setRangeSelected] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isNotes, setisNotes] = useState(false);

  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [flatListReady, setFlatListReady] = useState(false);
  // const [unit, setUnit] = useState('lb');

  useEffect(() => {
    if(imageRoute.imageData != null && imageData != null && imageRoute.imageData.length > imageData!.length){
      console.log("This condition was met!");
      setCurrIndex(imageRoute.imageData.length - 1);
    }
    else if (imageData && imageData.length > 0) {
      setCurrIndex(imageData.length - 1);
    }
  }, [dataLoaded, imageData, dataChanged]);

  const onViewRef = useRef(({viewableItems}: {viewableItems: ViewToken[]}) => {
  
    if(viewableItems.length === 0) return;
     
       const item = viewableItems[0]?.item as imageDataType;
       setCurrImage(item);
       setCurrIndex(viewableItems[0]?.index || 0);  
  });


  const viewConfigRef = useRef({
 
    viewAreaCoveragePercentThreshold: 50
   });


 
   const flatListRef = useRef<FlatList<imageDataType>>(null);
   const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  
   const [filteredImageData, setFiltered] = useState<imageDataType[]>(imageData!);


  
  
  

   const weightSearchRef = useRef<RNTextInput>(null);
   const startRef = useRef<RNTextInput>(null);
   const endRef = useRef<RNTextInput>(null);


   const monthRef = useRef<RNTextInput>(null);
   const monthRef2 = useRef<RNTextInput>(null);
   const yearRef = useRef<RNTextInput>(null);
   const yearRef2 = useRef<RNTextInput>(null);

   const [pageLoaded, setPageLoaded] = useState(false);

  


 
   // const didInitialScroll = useRef(false);


   // console.log("This is the current index " + currIndex);
 
  
   useEffect(() => {
         
       if(imageData === null || imageData!.length <= 0) return;  
        
        setFiltered(imageData!);
        
        setTimeout(() => {
          
        try{
          flatListRef.current?.scrollToIndex({ index: imageData.length - 1, animated: true});
        }
        catch(error){
          console.log("Scroll Index Error: " + error);
        } 

      }, 300);
    
   }, [lastIndex, dataChanged, imageData]); 

   useEffect(() => {
    
     if(weight){
       const newData = imageData!.filter((item: imageDataType) =>
         item.weight.trim() === weight.toString().trim()
       )


       setFiltered(newData); 


       if(newData.length == 0){
         console.log("Not a valid date");
         setValidSearch(false);
       }
       else{
         console.log("This is a valid weight");
         setValidSearch(true);
       }


     }
     else if(startWeight || endWeight){
       const newData = imageData!.filter((item: imageDataType) =>
         parseInt(item.weight.trim()) >= parseInt(startWeight.toString().trim()) &&
         parseInt(item.weight.trim()) <= parseInt(endWeight.toString().trim())
       
       )


       setFiltered(newData);


       if(newData.length == 0){
         console.log("Not a valid date");
         setValidSearch(false);
       }
       else{
         console.log("This is a valid weight");
         setValidSearch(true);
       }
     }
      else if(month1 || year1 || month2 || year2){
       setValidSearch(false);
       setFiltered([]);
      if(month1.length === 2 && year1.length === 2 && month2.length === 2 && year2.length === 2){
       const startMonth = month1.toString().trim()[0] === '0' ? month1.toString()[1] : month1.toString();
       const startYear = year1.toString().trim()[0] === '0' ? year1.toString()[1] : year1.toString();
       const endMonth = month2.toString().trim()[0] === '0' ? month2.toString()[1] : month2.toString();
       const endYear = year2.toString().trim()[0] === '0' ? year2.toString()[1] : year2.toString();


       const newData = imageData!.filter((item: imageDataType) => {
            const itemMonth = item.date.substring(0,2).trim()[0] === '0' ? item.date.substring(0,2).trim()[1] : item.date.substring(0,2).trim();
            const itemYear = item.date.substring(6,8).trim()[0] === '0' ? item.date.substring(6,8).trim()[1] : item.date.substring(6,8).trim();

            return ((parseInt(startYear) < parseInt(itemYear) && parseInt(itemYear) < parseInt(endYear) && parseInt(startMonth) >= 1 && parseInt(startMonth) <= 12 && 
                    parseInt(endMonth) >= 1 && parseInt(endMonth) <= 12) ||
                    (parseInt(startYear) == parseInt(itemYear) && parseInt(startMonth) <= parseInt(itemMonth) && parseInt(itemYear) < parseInt(endYear) && parseInt(startMonth) >= 1 && parseInt(startMonth) <= 12 && 
                    parseInt(endMonth) >= 1 && parseInt(endMonth) <= 12) ||
                    (parseInt(startYear) < parseInt(itemYear) && parseInt(itemMonth) <= parseInt(endMonth) && parseInt(itemYear) == parseInt(endYear) && parseInt(startMonth) >= 1 && parseInt(startMonth) <= 12 && 
                    parseInt(endMonth) >= 1 && parseInt(endMonth) <= 12) ||
                    (parseInt(startYear) == parseInt(itemYear) && parseInt(startMonth) <= parseInt(itemMonth) && parseInt(itemMonth) <= parseInt(endMonth) && parseInt(itemYear) == parseInt(endYear) && parseInt(startMonth) >= 1 && parseInt(startMonth) <= 12 && 
                    parseInt(endMonth) >= 1 && parseInt(endMonth) <= 12)
          
            )
       }  
     ) 
       setFiltered(newData);
       if(newData.length == 0){
        
         setValidSearch(false);
       }
       else{
        
         setValidSearch(true);
       }}
     }
     else if((month || year) && !(month2 || year2)){
       const newData = imageData!.filter((item: imageDataType) =>
       item.date.substring(0,2).trim() === month.toString().trim() &&
       item.date.substring(6,8).trim() === year.toString().trim()
     ) 
       setFiltered(newData);
       if(newData.length == 0){
        
         setValidSearch(false);
       }
       else{
        
         setValidSearch(true);
       }
     }
    
     else{
       setValidSearch(true);
       setFiltered(imageData!);
     }
   }, [weight, startWeight, endWeight, month, day, year, imageData, month1, year1, month2, year2])


   useEffect(() => {
     const keyBoardShowListener = Keyboard.addListener(
       'keyboardWillShow', () => setKeyboardShow(true)
     )
     const keyBoardHideListener = Keyboard.addListener(
       'keyboardWillHide', () => setKeyboardShow(false)
     )
   })
 
   useEffect(() => {
     setTimeout(() => {
       setShowNoData(data => !data);
     }, 400)
   }, [])


   useEffect(() => {
      if(unit === null){
      const getUnit = async () => {
        try{
          const dbCollection = collection(firestore, 'Users');
          const docRef = doc(dbCollection, GlobalState.uid);
          const docSnap = await getDoc(docRef);


          if(docSnap.exists()){
          const user = docSnap.data() as UserDataTypes;
          setUnit(user?.unit)
          }


          console.log(unit);
      }
      catch(error){
        console.log("Error: " + error);
      }
    }


      getUnit()
    }

   }, [])



   const removeKeyboard = () =>{
     InteractionManager.runAfterInteractions(() => {
       Keyboard.dismiss();
       setKeyboardShow(false);
     })
    
   }


   const exitSearch = () => {
     removeKeyboard();
     setWeightSearch(false);
     setDateSearch(false);
     setWeight('')
     setMonth('')
     setDay('')
     setYear('')
     setMonth1('')
     setYear1('')
     setMonth2('')
     setYear2('')
     setRangeSelected(false);
     setFiltered(imageData!);
   }

   
    const [isPinching, setIsPinching] = useState(false);
    const scale = useSharedValue(1);

    const translateX = useSharedValue(1);
    const translateY = useSharedValue(1);
    const saveTranslateX = useSharedValue(1);
    const saveTranslateY = useSharedValue(1);


    const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      let nextScale = e.scale;
      if(nextScale > 4) nextScale = 4;
      if(nextScale < .5) nextScale = .5;
      scale.value = nextScale;
      runOnJS(setIsPinching)(true);
    })
    .onEnd(() => {
      
      // scale.value = withSpring(1, {damping: 100, stiffness: 300});
      scale.value = withTiming(1);
      runOnJS(setIsPinching)(false);
    })

    const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = saveTranslateX.value + e.translationX;
      translateY.value = saveTranslateY.value + e.translationY;
      runOnJS(setIsPinching)(true);
    })
    .onEnd(() => {
      translateX.value = saveTranslateX.value;
      translateY.value = saveTranslateY.value;
      runOnJS(setIsPinching)(false);
    })

    const pinchPanGesture = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedValue = useAnimatedStyle(() => ({
      transform: [
        {scale: scale.value},
        {translateX: translateX.value},
        {translateY: translateY.value}
      ],


    }));

  if(allowedAccess === null || validSubscription === null){  
    return(<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'}}>
    <ActivityIndicator size="large" color="#00ffff" />
  </View> )
  }
  
   return(
     <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
     <View style={styles.pageContainer} onLayout={() => {setPageLoaded(item => !item)}}>

       {
       (imageData == null || imageData!.length === 0 && showNoData) ?
       <View style={{position: 'absolute', top: '50%', alignSelf: 'center'}}>
         <Text style={styles.text}>No Data to Display</Text>
       </View> : null
       }


       {!validSearch ? <View style={{position: 'absolute', top: '50%', alignSelf: 'center'}}>
         <Text style={styles.text}>- No results found -</Text>
       </View> : null}

         {isNotes ?
             <View key={currImage?.notes} style={styles.notePad}>
                 <TouchableOpacity style={{position: 'absolute', top: 10, right: 10, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                 onPress={() => setisNotes(note => !note)}>
               <Text style={styles.text}>X</Text>
               </TouchableOpacity>
             <ScrollView
              horizontal={false}
             style={{flex: 1}}
             contentContainerStyle={{padding: 20, paddingBottom: 40, flexGrow: 1}}
             showsHorizontalScrollIndicator={false}
             showsVerticalScrollIndicator={true}
             keyboardShouldPersistTaps="handled"
             >
             <Pressable>
             <Text style={{color: 'white', fontSize: 20, lineHeight: 28, 
             flexShrink: 1,  }}>{currImage?.notes}</Text>
             </Pressable>
             </ScrollView>
           
             </View>
           : null}


        


       {(!selfieSelected && !fullBodySelected && (imageData != null && imageData!.length > 0) && !isNotes) ?
       <View style={{width: 400}}>
           {(weightSearch || dateSearch) && !isNotes ? 
                          <TouchableOpacity style={(weightSearch || dateSearch) ? styles.exitButton1 : styles.exitButton2} onPress={exitSearch}> 
                                  <Text style={styles.text}>X</Text>
                              </TouchableOpacity>
                    : null
                      }

                {((weightSearch) && !isNotes) ?
                            <TouchableOpacity style={rangeSelected ? styles.rangeButton2 : styles.rangeButton1}
                            onPress={() => {
                            setRangeSelected(select => !select)
                            setWeight('');
                              if(weightSearch){
                                setTimeout(() => {
                                  startRef.current?.focus();
                                }, 150)
                              }
                              }
                            }> 
                          <Image source={require('./range.png')} style={{width: 35, height: 30}} />
                          </TouchableOpacity> : null
                        }
                {(dateSearch && !isNotes) ?
                            <TouchableOpacity style={rangeSelected ? styles.rangeButton2 : styles.rangeButton1}
                            onPress={() => {
                            setRangeSelected(select => !select)
                            setMonth('');
                            setYear('');
                            setMonth1('');
                            setYear1('');
                            setMonth2('')
                            setYear2('');
                              if(dateSearch){
                                setTimeout(() => {
                                  monthRef.current?.focus();
                                }, 150)
                              }
                              }
                            }> 
                          <Image source={require('./range.png')} style={{width: 35, height: 30}} />
                          </TouchableOpacity> : null
                        }
           <View style={styles.searchContainer}>
          
                { (weightSearch && !rangeSelected) ?
                <View style={{minWidth: 180, alignItems: 'center'}}>
                <TextInput 
                value={weight}
                keyboardType='numeric'
                ref={weightSearchRef} style={styles.textInputText} placeholder='Search Weight' onChangeText={(text) => {setWeight(text)}}  maxLength={10}/>
               </View>
                : <View>
                 { (weightSearch && rangeSelected) ?
                 <View style={{ minWidth: 125, flexDirection: 'row', justifyContent: 'center'}}>
                   <TextInput
                   ref={startRef}
                   value={startWeight}
                   style={styles.textInputText}
                   placeholder='Start'
                   onChangeText={(text) => {
                     setStartWeight(text);
                   }} 
                   onSubmitEditing={() => endRef.current?.focus()}
                   maxLength={5} keyboardType='numeric'/>


                   <Text style={styles.text}> - </Text>


                   <TextInput
                   ref={endRef}
                   value={endWeight}
                   onKeyPress={({nativeEvent}) => {
                     if(nativeEvent.key === 'Backspace' && endWeight.length === 0){
                       startRef.current?.focus();
                     }
                   }}
                   style={styles.textInputText} placeholder='End' onChangeText={(text) => {setEndWeight(text)}}  maxLength={5} keyboardType='numeric'/>

              
                  
                </View>
                     :
                     <View>
                        {(dateSearch && !rangeSelected) ?
                      <View style={{width: 125, flexDirection: 'row', justifyContent: 'center'}}>
                          <TextInput ref={monthRef} style={styles.textInputText} placeholder='MM'
                       onChangeText={(text) => {
                           setMonth(text)
                           if(text.length === 2){
                             yearRef.current?.focus();
                           }
                       }} 
                         maxLength={2} keyboardType='numeric'
                         value={month}
                         />
                       <Text style={styles.text}> / </Text>
                       <TextInput ref={yearRef} style={styles.textInputText} placeholder='YY' onChangeText={(text) => {setYear(text)}}
                       onKeyPress={({nativeEvent}) => {
                         if(nativeEvent.key === 'Backspace' && year.length === 0){
                            monthRef.current?.focus()
                         }
                       }}
                       maxLength={2} keyboardType='numeric'
                      value={year}
                       />
                      
                      </View>
                       : <View>
                         { (dateSearch && rangeSelected) ?
                        <View style={{ flexDirection: 'row'}}>
                          <TextInput ref={monthRef} style={styles.textInputText} placeholder='MM'
                       onChangeText={(text) => {
                           setMonth1(text)
                           if(text.length === 2){
                             yearRef.current?.focus();
                           }
                       }} 
                        maxLength={2} keyboardType='numeric'
                        value={month1}
                         />
                       <Text style={styles.text}> / </Text>
                       <TextInput value={year1} ref={yearRef} style={styles.textInputText} placeholder='YY' onChangeText={(text) => {
                        setYear1(text)
                         if(text.length === 2){
                             monthRef2.current?.focus();
                         }
                      }}
                       onKeyPress={({nativeEvent}) => {
                         if(nativeEvent.key === 'Backspace' && year1.length === 0){
                            monthRef.current?.focus()
                         }
                         
                       }}
                       maxLength={2} keyboardType='numeric'/>

                       <Text style={styles.text}> - </Text>

                       <TextInput value={month2} ref={monthRef2} style={styles.textInputText} placeholder='MM'
                       onChangeText={(text) => {
                           setMonth2(text)
                           if(text.length === 2){
                             yearRef2.current?.focus();
                           }
                       }}
                        onKeyPress={({nativeEvent}) => {
                         if(nativeEvent.key === 'Backspace' && month2.length === 0){
                            yearRef.current?.focus()
                         }
                       }} 
                         maxLength={2} keyboardType='numeric'/>
                       <Text style={styles.text}> / </Text>
                       <TextInput ref={yearRef2} value={year2} style={styles.textInputText} placeholder='YY' onChangeText={(text) => {setYear2(text)}}
                       onKeyPress={({nativeEvent}) => {
                         if(nativeEvent.key === 'Backspace' && year2.length === 0){
                            monthRef2.current?.focus()
                         }
                       }}
                       maxLength={2} keyboardType='numeric'/>

                       
                       </View>
                            :  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                              <Image source={require('./mgi.png')} style={{height: 30, width: 30}}/>
                              <Text style={styles.text}>  Select:</Text>
                              <TouchableOpacity style={{marginLeft: 8, borderWidth: 1, borderColor: '#00ffff', borderRadius: 15, backgroundColor: '#278686ff', padding: 2}}
                               onPress={() => {
                                 setWeightSearch(item => !item)
                                 setTimeout(() => {
                                   weightSearchRef.current?.focus()
                                 }, 100)
                               }
                               }><Text style={styles.weightText}>Weight</Text>
                               </TouchableOpacity>
                              <Text style={styles.text}> or</Text>
                              <TouchableOpacity style={{marginLeft: 4, borderWidth: 1, borderColor: '#00ffff', borderRadius: 15, backgroundColor: '#278686ff', padding: 2}}
                               onPress={() => {
                                 setDateSearch(item => !item)
                                 setTimeout(() => {
                                   monthRef.current?.focus()
                                 }, 100)
                               }}>
                                 <Text style={styles.text}>Date</Text>
                               </TouchableOpacity>
                              </View>
                              }
                        </View>
                       }
                       </View>
                         }
                 </View>
                } 
           </View>
       </View>
       : null}


     {(!selfieSelected && !fullBodySelected) ?
           <View style={{height: 650}}>
       
       <View style={{width: 340, height: 620, marginLeft: 0, alignItems: 'center'}}>

       {(!isNotes) ? (
       <FlatList<imageDataType>
           onLayout = {() => setFlatListReady(true)}
           style={{display: isNotes ? 'none' : 'flex'}}
           horizontal
           ref={flatListRef}
           data={filteredImageData}
           keyExtractor={(item, index) => index.toString()}
           initialScrollIndex={Math.max(currIndex, 0)}
          
           onViewableItemsChanged={onViewRef.current}
           viewabilityConfig={viewConfigRef.current}

           getItemLayout={(data, index) => ( 
             {length: 242, offset: 242 * index, index}  
       )}
     renderItem={({item, index}) => (
         <View style={{flex: 1}}>

           { !isNotes ? <View>
             <Pressable>
          <View style={styles.imagesContainer}>
            
             {(item.selfie ) ?
             <TouchableOpacity onPress={() => {
               setSelfieSelected(selected => !selected)
             }}>   

               
            <FastImage style={selfieLoadedList.current[index] ? styles.image : styles.imageLoading} source={{uri: item.selfie}} onLoadEnd={() => {selfieLoadedList.current[index] = true
            bigSelfieLoadedList.current[index] = true;
            }} onError={() => {
              console.log("Selfie image can't load");
              // console.log("Selfie path " + item.selfie)
              // console.log("User Directory: " + userDir)


              selfieLoadedList.current[index] = false
              if(!loadError){
                console.log("set load error to true");
                setLoadError(true); 
              }
              else{
                restoreLocalData();
              }
              
            }

              }/>
            {!selfieLoadedList.current[index] ? 
            <View style={{position: 'absolute', top: '47%', left: '20%'}}>
             <Text style={styles.smallerText}>Image Loading...</Text>
             </View> : null}
             </TouchableOpacity>
             : 
             <View style={styles.image}>
             <Text>No Image</Text>
             </View>
             }
           <View style={styles.textContainer}>
           <Text style={styles.text}>Weight: {item.weight} {unit}</Text>
           <Text style={styles.dateText}>{item.date}</Text>
           </View>
           {(item.fullBody) ?
           <TouchableOpacity onPress={() => {
             setFullBodySelected(selected => !selected)
            //  setWeightSearch(false);
            //  setDateSearch(false);
           }}>
            <FastImage style={fullBodyLoadedList.current[index] ? styles.image : styles.imageLoading} source={{uri:item.fullBody}} onLoadEnd={() => {fullBodyLoadedList.current[index] = true
             bigFullBodyLoadedList.current[index] = true;
            }} onError={() => {
              console.log("full body image can't load");
              
              fullBodyLoadedList.current[index] = false
            }}

            
              />
            {!fullBodyLoadedList.current[index] ? 
            <View style={{position: 'absolute', top: '47%', left: '20%'}}>
             <Text style={styles.smallerText}>Image Loading...</Text>
             </View> : null}
           </TouchableOpacity>
          
           :
           <View style={styles.image}>
             <Text>No Image</Text>
             </View>
           }
           </View>
           </Pressable>


           <TouchableOpacity style={{position: 'absolute', top: 40, right: 20}} onPress={() => setisNotes(note => !note)}>
               <Image style={{width: 40, height: 40, borderRadius: 15, opacity: 1}} source={require('./notePadImage.png')}/>
               </TouchableOpacity>
               </View> : null}
           
            
           </View>
            
           )}>
              </FlatList>
         ) : null
              }
             
              </View>
               </View>
        : <View>
           { (!fullBodySelected) ?
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
               <Text style={!isPinching ? styles.largeDateText : {opacity: 0}}>Weight: {currImage?.weight} {unit}</Text>
          
               {(currImage?.selfie) ?
               <View style={{overflow: 'visible'}}>
               <TouchableOpacity onPress={() => {
                 setSelfieSelected(selected => !selected)
                 
                //  setWeightSearch(false);
                //  setDateSearch(false);
               }} style={{shadowOffset: {width: 0, height: 0},
                shadowRadius: 15,
                shadowOpacity: 1,
                shadowColor: '#00ffff'}}>
                    <GestureDetector gesture={pinchPanGesture}>
                      <Animated.View style={animatedValue}>
                   <FastImage style={bigSelfieLoadedList.current[currIndex] ? styles.bigImage2 : styles.bigImageLoading2} source={{uri: currImage?.selfie}} onLoadEnd={
                   () => bigSelfieLoadedList.current[currIndex] = true
                   }
                   onError={() => bigSelfieLoadedList.current[currIndex] = false}
                   />
                   </Animated.View>
                   </GestureDetector>
                   {!bigSelfieLoadedList.current[currIndex] ? 
                  <View style={{position: 'absolute', top: '45%', left: '24%' }}>
                  <Text style={styles.text}>Image Loading...</Text>
                  </View> : null}
               </TouchableOpacity>
               
               </View>
               : <Text>No Image</Text>}
               <Text style={!isPinching ? styles.largeDateText : {opacity: 0}}>{currImage?.date}</Text>
           </View> :
           <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={!isPinching ? styles.largeDateText : {opacity: 0}}>Weight: {currImage?.weight} {unit}</Text>
           {(currImage?.fullBody) ?
             <TouchableOpacity onPress={() => {
               setFullBodySelected(selected => !selected)
              //  setWeightSearch(false);
              //  setDateSearch(false);
             }} style={{shadowOffset: {width: 0, height: 0},
            shadowRadius: 15,
            shadowOpacity: 1,
            shadowColor: '#00ffff'}}>
                <GestureDetector gesture={pinchPanGesture}>
                  <Animated.View style={animatedValue}>
                 <FastImage style={bigFullBodyLoadedList.current[currIndex] ? styles.bigImage2 : styles.bigImageLoading2} source={{uri: currImage?.fullBody}} onLoadEnd={
                   () => bigFullBodyLoadedList.current[currIndex] = true
                   }
                   onError={() => bigFullBodyLoadedList.current[currIndex] = false}
                   />
                   </Animated.View>
                   </GestureDetector>
                   {!bigFullBodyLoadedList.current[currIndex] ? 
                <View style={{position: 'absolute', top: '45%', left: '24%' }}>
                <Text style={styles.text}>Image Loading...</Text>
                </View> : null}
             </TouchableOpacity>
             : <Text>No Image</Text>}
             <Text style={!isPinching ? styles.largeDateText : {opacity: 0}}>{currImage?.date}</Text>
           </View>}
           </View>
           }




       {(!selfieSelected && !fullBodySelected && !isNotes) ?
      
             <View style={styles.navigationContainer}> 


                <View style={styles.navigationButtonContainer}>
                   <TouchableOpacity onPress={() => {
                    console.log(allowedAccess + " " + storingDone)
                     if(true && storingDone === true){
                      console.log(allowedAccess! + " This is the access");
                       navigation.navigate('Home')
                     }
                     else{
                        if(!allowedAccess){
                        Alert.alert('Attention', 'You have already taken your max photos for the day!');
                        }
                        else if(storingDone === null || storingDone === false){
                          Alert.alert('Attention', 'Please wait until your images have downloaded!');
                        } 
                      }
                     }} style={styles.navigationButton}>
                     <Image source={require('./cameraIcon.png')} style={{width: 35, height: 35}}></Image>
                   </TouchableOpacity>
                 </View>
                 <View style={{justifyContent: 'center'}}>
                 <TouchableOpacity onPress={() => {
                  navigation.navigate('ChartPage', {imageData: imageData!}) 
                  // if(storingDone == true){ 
                  // navigation.navigate('ChartPage', {imageData: imageData!}) 
                  // }
                  // else if(storingDone === null || storingDone === false){
                  //         Alert.alert('Attention', 'Please wait until your images have loaded!');
                  //       } 
                
                }}
                  style={styles.navigationButton}
                  >
                     <Image source={require('./chartIcon.png')} style={{width: 35, height: 35}}/>
                   </TouchableOpacity>
                 </View>
             </View>
                 : null}


         
        </View>
        </TouchableWithoutFeedback>
   )
}

