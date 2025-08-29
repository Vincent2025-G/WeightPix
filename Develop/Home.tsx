import React, {useState, useEffect, useRef, useLayoutEffect, useContext} from 'react';
import type {PropsWithChildren} from 'react';
import { NavigationContainer, createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList } from './StackList';
import {Camera, useCameraDevice, useCameraFormat,  useCameraPermission, CameraPermissionStatus, PhotoFile} from 'react-native-vision-camera';
import {format} from 'date-fns';
import { imageDataType } from './StackList';
import ScreenBrightness from 'react-native-screen-brightness';
import { GlobalState } from './GlobalState';
import {collection, doc, getDoc, Timestamp, updateDoc, arrayUnion, deleteDoc} from '@react-native-firebase/firestore'
// import {ref, getDownloadURL, putFile, getStorage, deleteObject, listAll} from '@react-native-firebase/storage'
import { auth, firestore, storage } from './Firebase.ts';
// import storage from '@react-native-firebase/storage';
import {EmailAuthProvider, reauthenticateWithCredential, deleteUser} from '@react-native-firebase/auth'
import { CopilotProvider, CopilotStep, walkthroughable, useCopilot } from 'react-native-copilot';
import * as RNFS from '@dr.pogodin/react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from './UserData';
import { sendPasswordResetEmail, signOut } from '@react-native-firebase/auth';

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInput as RNTextInput,
  useColorScheme,
  View, 
  Button,
  FlatList,
  SectionList,
  Image,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  InteractionManager,
  Animated,
  DevSettings,
  Alert,
  KeyboardAvoidingView,
  Platform,
  findNodeHandle,
  NativeEventEmitter,
  NativeModules,
  AppState,
  AppStateStatus,
  AppStateEvent
} from 'react-native';

import { TooltipComponent } from './CopilotTooltip.tsx';
import { useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { constructFromSymbol } from 'date-fns/constants';
// import { listAll } from 'react-native-firebase/firestore';
// import { createCipheriv } from 'crypto';
// import { count } from 'console';


const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: '100%',
    width: '100%'
    },
    buttonContainer: {
      position: "absolute",
      bottom: 40,
      alignSelf: "center",
      borderRadius: 50,
      borderWidth: 3,
      borderColor: 'white',
      width: 78,
      height: 78, 
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#00ffff',
      shadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
      shadowRadius: 3, // Controls how far the shadow blurs out.
      shadowOpacity: 1
    },
    imageContainer: {
      height: '100%',
      width: "100%"
    },
    imageTextContainer1: {
      position: "absolute",
      bottom: '45%',
      left: '42%',
      flex: 1,
      flexDirection: 'row',
    },
    imageTextContainer2: {
      position: "absolute",
      bottom: '40%',
      left: '44.5%',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
  
      width: 100
    },
   
    photoPageButtonContainer:{
      position: 'absolute', 
      right: "13%",
      bottom: '7%',
      borderColor: '#00ffff',
      borderWidth: 2,
      borderRadius: 16,
      backgroundColor: 'white'
    },
    
    cameraPageTextContainer:{
       marginTop: 60,
       alignItems: 'center',
       alignSelf: 'center',
       backgroundColor: '#359EA0',
       borderRadius: 10,
       padding: 3
    },
    timerContainer:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    flashButtonContainerOff:{
      position: 'absolute', 
      left: 30, 
      top: 62, 
      alignItems: 'center', 
      borderColor: '#00ffff', 
      borderRadius: 50,
      borderWidth: 1
    },
    flashButtonContainerOn:{
      position: 'absolute', 
      left: 30, 
      top: 62, 
      alignItems: 'center',
      // shadowColor: '#00ffff',
      // shadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
      // shadowRadius: 8, // Controls how far the shadow blurs out.
      // shadowOpacity: 1,
      borderColor: '#00ffff', 
      borderRadius: 50,
      borderWidth: 3
    },
    flipCameraContainer:{
      position: 'absolute', 
      right: 30, 
      top: 60,
      borderColor: '#00ffff', 
      borderRadius: 50,
      borderWidth: 1
    },
    accountContainer:{
      position: 'absolute', 
      bottom: 120,
      left: 10,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: 'grey',
      backgroundColor: 'white',
      opacity: 0.8,
      width: 150,
      flexDirection: 'column',
      alignItems: 'center',      
      
      
    },
    confirmPasswordContainer:{
      width: 280, 
      height: 150, 
      position: 'absolute', 
      left: '15.5%', 
      top: '40%', 
      backgroundColor: 'white', 
      borderRadius: 15, 
      padding: 15,
      borderWidth: 1,
      borderColor: 'white',
      
      
    },
    measurementContainer: {
      backgroundColor: 'grey',
      position: 'absolute',
      left: 45,
      flexDirection: 'row',
      gap: 5, 
      borderRadius: 20, 
      alignItems: 'center', 
      justifyContent: 'center',
      
    },
    lbs:{
      height: 40,
      width: 60, 
      alignItems: 'center', 
      justifyContent: 'center',
    },
    lbsSelected:{   
      height: 40,
      width: 60, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#00ffff',
      borderStartStartRadius: 20,
      borderBottomStartRadius: 20
    },
    kgs:{      
      height: 40,
      width: 60, 
      alignItems: 'center', 
      justifyContent: 'center'
    },
    kgsSelected:{   
      height: 40,
      width: 60, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#00ffff',
      borderTopEndRadius: 20,
      borderBottomEndRadius: 20
    },
    notePad:{
      width: 300, 
      height: 300, 
      position: 'absolute', 
      left: '13%', 
      top: '8%', 
      backgroundColor: 'white', 
      borderRadius: 15, 
      paddingTop: 20,
      paddingBottom: 120,
      paddingLeft: 20,
      paddingRight: 20,
      fontSize: 20,
      color: 'black',
      borderWidth: 1,
      borderColor: '#00ffff' 
    },
    flashButton:{
      height: 30, 
      width: 30, 
      borderRadius: 50
    },
    flipCameraButton:{
      height: 35, 
      width: 35, 
      borderRadius: 50,
      backgroundColor: 'white'
    },
    captureButton: {
      backgroundColor: 'white',
      width: 70,
      height: 70,
      borderRadius: 50,
    },
    retakeButton:{
      position: "absolute",
      bottom: 60,
      left: 25
    },
    nextButton:{
      position: "absolute",
      bottom: 60,
      right: 25
    },
    doneButton:{
      position: "absolute",
      bottom: 60,
      right: 25
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
    accountButton:{
      backgroundColor: '#359EA0',
      height: 50,
      width: 50,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center'
    },
    accountOption1: {
      borderColor: 'grey', 
      width: '100%',
       alignItems: 'center', 
      justifyContent: 'center',       
       height: 40,
      
      borderBottomWidth: 1,
      flexDirection: 'column',
      
      
    },
    accountOption2: {
      borderColor: 'grey', 
      width: '100%',
       alignItems: 'center', 
      justifyContent: 'center',       
       height: 40,
      
      borderBottomWidth: 1
    },
    accountOption3: {
      borderColor: 'grey', 
      width: '100%',
       alignItems: 'center', 
      justifyContent: 'center',       
       height: 40,
      
    },
    accountOption4: {
      borderTopWidth: 1,
      borderBottomWidth: 1, 
      borderColor: 'grey', 
      width: '100%',
       alignItems: 'center', 
      justifyContent: 'center',       
       height: 40,
    },
    accountOption5:{
      borderColor: 'grey', 
      width: '100%',
       alignItems: 'center', 
      justifyContent: 'center',       
       height: 40,
    },
    text: {
      fontSize: 23,
      color: 'white',
      fontWeight: 'bold',
      // textShadowColor: '#00ffff',
      // textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
      // textShadowRadius: 2, // Controls how far the shadow blurs out.
      
    },
    text1: {
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
      // textShadowColor: '#00ffff',
      // textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
      // textShadowRadius: 2, // Controls how far the shadow blurs out.
      
    },
    textInputText:{
      fontSize: 23,
      color: 'white',
      fontWeight: 'bold',
      textShadowColor: '#00ffff',
      textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
      textShadowRadius: 2, // Controls how far the shadow blurs out.
      // borderWidth: 1, 
      width: 80,
      paddingLeft: 2,
      textAlign: 'center'
    },
    input:{
      width: 70, 
      height: 30, 
      backgroundColor: 'white', 
      borderRadius: 15, 
      fontSize: 20,
      color: 'black',
      borderWidth: 1,
      
      textAlign: 'center',
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 10
    },
    timerText:{
      fontSize: 80,
      color: 'white',
      fontWeight: 'bold',
      textShadowColor: '#00ffff',
      textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
      textShadowRadius: 2, // Controls how far the shadow blurs out.
    }
  });

  

  // type navProps = NativeStackScreenProps<RootStackParamList, "Home">;
  
  // type customProps = {
  //   imageData: imageDataType[];
  //   setImageData: React.Dispatch<React.SetStateAction<imageDataType[]>>;
  // }

  // type Props = navProps & customProps;
  type Props =  NativeStackScreenProps<RootStackParamList, "Home">;

  export const HomeScreen = ({navigation} : Props): React.JSX.Element => {

    // navigation.navigate("Payment"); 

    

    interface UserDataTypes{
      unit: string,
      email: string,
      username: string, 
      photos: imageDataType[]
    }

  const {imageData, setImageData, setGoalWeight, setUnit, unit, goalWeight } = useContext(UserData);
  const userDir = `${RNFS.DocumentDirectoryPath}/${GlobalState.uid}`;

  // console.log("This is the data length: " + imageData!.length)
   
  // console.log("Document Directory Path: " + RNFS.DocumentDirectoryPath.split('/')[6]);
  

  const objPath = `${userDir}/images.json`;
  const urlPath = `${userDir}/urls.json`;
  const changedDataPath = `${userDir}/changeddata.json`;
  const subInfoPath = `${userDir}/subInfo`;

  // console.log("Current object path: " + objPath);

  useEffect(() => {
    const fetchUserData = async () => {
     try{
        const dbCollection = collection(firestore, 'Users'); 
        const docRef = doc(dbCollection, GlobalState.uid);
        const docSnap = await getDoc(docRef); 
        console.log("Fetching user data ");
       // Checking if user exists
       if(docSnap.exists()){
        const user = docSnap.data() as UserDataTypes;
        setUsername(user?.username)
        // console.log("This is the data " + user?.username)
       }
       else{
        console.log("User not found!");
       }
     }
     catch(error){
       console.log("Couldn't fetch user data" + error)
     }
    }

    fetchUserData();
 }, [])

    // useEffect(() => {

    
      
    //   const populateImages = async () => {

    //     const files = await RNFS.readDir(userDir);
    //     if(files == null || !files || files.length === 0){
    //       console.log("Files is null");
    //     }
    //     else{
    //       console.log("Files isn't null");
    //     }

    //     files.forEach(file => {
    //       console.log(file.name);
    //     })

    //     const keys = await AsyncStorage.getAllKeys();
    //     console.log("Here are all the keys: " + keys);
        
    //     console.log(`${GlobalState.uid}`);
    //     const asyncData = await AsyncStorage.getItem(`${GlobalState.uid}`);
    //     console.log("Async Data " + asyncData);
    //     if(asyncData != null){
    //       const userData = JSON.parse(asyncData);
    //       console.log("This is the async data " + userData);
    //       setImageData(userData);
    //     }
    //     else{
          
    //     }
       
   
    //   }
    //   populateImages();
    // }, []);


    useEffect(() => {
      
      const setImages = async () => {
      // Deleting for testing
      // try{
      //   await AsyncStorage.clear();
      //   RNFS.unlink(userDir);
      // } 
      // catch(error){
      //   console.log("Error: " + error);
      // }

       try{ 
        
        const exists = await RNFS.exists(userDir);
        if(!exists){
          setImageData([]);
          return;
        }
        const storedImageData = await RNFS.readFile(objPath, 'utf8');
        const storedImageObj = JSON.parse(storedImageData);
        if((imageData != null && exists && imageData.length > storedImageObj.length)){
          return;
        }

        setImageData(storedImageObj);
        console.log("The image data in RNFS")
        // for(const item of storedImageObj){
        //   // console.log("Images path" + item.selfie.split('/')[7])
        // }
      
      }
        catch(error){
          console.log("Error with RNFS: " + error);
        }
      }
  
      setImages();
    }, [])
  
  
  
  // Used to get picture paths.
  const cameraRef = useRef<Camera>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const isFocused = useIsFocused();
  const [cameraReady, setCameraReady] = useState(false);
  

  useEffect(() => {
    
    const retryResume = () => {
      console.log("This is the cameraReady State: " + cameraReady + " This is camera Ref state " + cameraRef.current);
      console.log("This is if focused " + isFocused);
      if (cameraReady && cameraRef.current && isFocused) {
        try {
          cameraRef.current.resumeRecording();
          console.log("Resumed recording");
        } catch (err) {
          console.warn("resumeRecording failed, retrying", err);
          setTimeout(retryResume, 300);
        }
      } else {
        console.log("Waiting for camera to be ready");
        setTimeout(retryResume, 300);
      }
    };
  
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        console.log('Pausing recording');
        cameraRef.current?.pauseRecording();
      }
  
      if (nextState === 'active') {
        console.log('Preparing to resume recording');
        setTimeout(retryResume, 500); // slight delay to allow remount
      }
    };
  
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
      
  }, [appState, cameraRef, cameraReady]) 

  // Used to set the focus onto the text input for weight.
  const inputRef = useRef<RNTextInput>(null);
  const noteRef = useRef<RNTextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  // Used to end the countdown.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countDownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // const uiAnim = useRef(new Animated.Value(0)).current;

  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [fullbodyPath, setFullbodyPath] = useState<string | null>(null);
  const [nextPic, setNextPic] = useState(false);
  const [keyboardShow, setKeyboardShow] = useState(false);
  const [weight, setWeight] = useState('');
  const [timer, setTimer] = useState(5);
  // const [countDown, setCountDown] = useState(60); // 86400 is a day
  const [startTime, setstartTime] = useState(false);
  const [flash, setFlash] = useState(false);
  const [brighten, setBrighten] = useState(false);
  const [flip, setFlip] = useState(false);
  const [snap, setSnap] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [hasNewWeight, sethasNewWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // const [unit, setUnit] = useState('lb');
  const [changeUnit, setChangeUnit] = useState(false);
  
  const email = useRef('');
  const [showAccount, setShowAccount] = useState(false);

  const [isNotes, setisNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const {hasPermission} = useCameraPermission();

  const device = useCameraDevice(flip ? 'back' : 'front');

  const passwordRef = useRef<RNTextInput>(null);
  const weightRef = useRef<RNTextInput>(null);

  const tour = useCopilot();
  const WalkthroughableView = walkthroughable(View) 
  const [firstTime, setFirstTime] = useState(true);
  const [retakeReady, setRetakeReady] = useState(false);
  const [fullBodyReady, setFullBodyReady] = useState(false);
  const [journalReady, setJournalReady] = useState(false);

  const [help, setHelp] = useState(false);
  


// useEffect(() =>{ 
//   if(firstTime && selfiePath){
    
//       tour.start("Retake") ;
//       console.log("It worked!");
    
//   }
// }, [selfiePath, retakeReady])   

// useEffect(() =>{ 
//   if(firstTime){
//       tour.start("Flip Camera");  
//   }
// }, [fullBodyReady])  

// useEffect(() =>{ 
//   if(firstTime && journalReady && !keyboardShow && fullbodyPath && selfiePath){ 
//       tour.start("Journal");  
//   }
// }, [journalReady, keyboardShow])   
   
 
   
    const capturePhoto1 = async () =>{
      setShowAccount(false);
      setHelp(false);
      setChangeUnit(false);
      sethasNewWeight(false);
      if(cameraRef.current == null){
        console.log("Camera couldn't capture!")
        return null;
      } 
      if(flash){
        setBrighten(true);
        await flashUpdate();
        setBrighten(false);
      }
      const photo: PhotoFile = await cameraRef.current.takePhoto();

      setSelfiePath(photo.path);

      getFileSize(photo.path);
      
    }
    const capturePhoto2 = async () =>{
      setShowAccount(false);
      setHelp(false);
      setChangeUnit(false);
      sethasNewWeight(false);
        setstartTime(true);

        if(timerRef.current !== null) return null; // Interval is already running so stop!
        
        // Setting the interval reference and clearing it when the
        // counter reaches  below 1 so that it doesn't create duplicates.
        timerRef.current = setInterval(() => {
          setTimer(prev => {
            if(prev <= 1){
              // Clear interval stops the interval created with setInterval.
              // setInterval will be called forever without it.
              clearInterval(timerRef.current!);
              // Setting interval to null just as a safety measure.
              timerRef.current = null;
              return 0;
            }
            return prev - 1;
          })
          // Running every 1 second.
        }, 1000)

        if(cameraRef.current == null){
          console.log("Camera couldn't capture!")
          return null;
        } 

        // Setting a delay for the full body picture 
        const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
        await delay(5000);

        if(flash && !flip){
          setBrighten(true);
          await flashUpdate();
          setBrighten(false);
        }

        if(flash && flip){
          setSnap(true);
          await delay(1000);
        }

        const photo: PhotoFile = await cameraRef.current.takePhoto();
        setFullbodyPath(photo.path);

        getFileSize(photo.path);
        setSnap(false)

    }

    useEffect(() => {
      const keyBoardShowListener = Keyboard.addListener(
        'keyboardWillShow', () => setKeyboardShow(true)
      )
      const keyBoardHideListener = Keyboard.addListener(
        'keyboardWillHide', () => setKeyboardShow(false)
      )

      // Removing to prevent bugs with the event listener
      return () => {
        keyBoardShowListener.remove();
        keyBoardHideListener.remove();
      }
    }, [keyboardShow])

    useEffect(() =>{
      const timer = setTimeout(() => {
        inputRef.current?.focus(); 
      }, 100);

      return () => clearTimeout(timer);
    }, [fullbodyPath])

    useEffect(() => {
      if(confirmPassword){
        passwordRef.current?.focus();
      }
    }, [confirmPassword])

    useEffect(() => {
      if(hasNewWeight){
        weightRef.current?.focus();
      }
    }, [hasNewWeight])

    useEffect(() => {
      const getUnit = async () => {
        try{
          const dbCollection = collection(firestore, 'Users'); 
          const docRef = doc(dbCollection, GlobalState.uid);
          const docSnap = await getDoc(docRef); 

         if(docSnap.exists()){
          const user = docSnap.data() as UserDataTypes;
          setUnit(user?.unit === null ? 'lb': user?.unit)
          
         }

         
      }
      catch(error){
        console.log("Error: " + error);
      }
    }

      getUnit()
    }, [])

  
    


    const flashUpdate =  async () => {
      
      const currBrightness = await ScreenBrightness.getBrightness();
      await ScreenBrightness.setBrightness(1.0);
      
      const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
      await delay(2000);
      await ScreenBrightness.setBrightness(currBrightness);
  
     
    }

    

    const listSizes = async (initialPath: string) => {
      
      let sizes:any = [];

      const cd = async (path: string) => {
        const items = await RNFS.readDir(path);
        for(const item of items){
          if(item.isFile()){
            const mb = Math.floor(item.size / (1024 * 1024));
            sizes = [...sizes, mb];
          }
          else if(item.isDirectory()){
            await cd(item.path)
          }
        }
     }

     await cd(initialPath);
     return sizes;

    }



    useEffect(() => {
      const callDirs = async () => {
        const sizes = await listSizes(userDir)
        console.log("Sizes" + sizes);
        console.log(sizes.length);
      }

      const getFileSizes = async () => {
        try{
          const objStat = await RNFS.stat(objPath);
          const itemStat = await RNFS.stat(changedDataPath);
          console.log("ObjPath size: " + objStat.size);
          console.log("changedData size: " + itemStat.size);
        }
        catch(error){
          console.log("Error: " + error)
        } 
      }


      // callDirs();
      getFileSizes();

      
    }, [])


    const storeData = async () =>{
      if(weight.length < 2){
        Alert.alert("Please enter your weight.");
        return;
      }

      const formattedDate = format(new Date(), 'MM/dd/yy'); 

      // console.log("selfie path " + selfiePath);
      // console.log("full body path " + fullbodyPath);

      const selfieName = selfiePath?.split("/").pop();
      const fullBodyName = fullbodyPath?.split("/").pop();

      console.log("Selfie Path: " + selfiePath + " Full Body Path: " + fullbodyPath);

      const fastImgObj: imageDataType = {selfie: selfiePath, fullBody: fullbodyPath, weight: weight, date: formattedDate, notes: notes, selfieName: selfieName, fullBodyName: fullBodyName}
      let currData: imageDataType[] = imageData!;
      let newImageData: imageDataType[] = [];
      
      if(currData == null){
        console.log("Fetching from database again!")
        try{
          const dbCollection = collection(firestore, 'Users'); 
          const docRef = doc(dbCollection, GlobalState.uid);
          const docSnap = await getDoc(docRef); 
  
          // Checking if user exists
          if(docSnap.exists()){
            const user = docSnap.data() as UserDataTypes;
            currData = user?.photos;
            newImageData = [...currData!, fastImgObj];
          }
          else{
            console.log("User not found!");
          }
        }
        catch(error){
          console.log("Couldn't fetch user data" + error)
        }
      } 
      else{
        newImageData = [...imageData!, fastImgObj];
      }

      setImageData(newImageData!);
      

      navigation.navigate('Data', {imageData: newImageData!});
 
      console.log("image data before retrieval " + newImageData);

      const selfieReference = storage().ref(`images/${GlobalState.uid}/${formattedDate}/selfie/${selfiePath}`);
      const fullBodyReference = storage().ref(`images/${GlobalState.uid}/${formattedDate}/fullbody/${fullbodyPath}`);

      await selfieReference.putFile(selfiePath ?? ''); 
      await fullBodyReference.putFile(fullbodyPath ?? ''); 
      // await fullBodyReference.putFile(fullbodyPath || ''); 
      
      // const selfieURL = await selfieReference.getDownloadURL();
      // const fullBodyURL = await fullBodyReference.getDownloadURL();
      const selfieURL = await selfieReference.getDownloadURL();
      const fullBodyURL = await fullBodyReference.getDownloadURL();

        

      const imgObj: imageDataType = {selfie: selfieURL, fullBody: fullBodyURL, weight: weight, date: formattedDate, notes: notes, selfieName: selfieName, fullBodyName: fullBodyName}
     
      // try{
      //   const dbCollection = collection(firestore, 'Users'); 
      //   const docRef = doc(dbCollection, GlobalState.uid); 
      //   const docSnap = await getDoc(docRef); 
 
      //    // Checking if user exists
      //    if(docSnap.exists()){
      //     const user = docSnap.data();
      //     newImageData = [...user?.photos, imgObj];
      //    }
      //    else{
      //     console.log("User not found!");
      //    }
      //  }
      //  catch(error){
      //    console.log("Couldn't fetch user data" + error)
      //  }

      newImageData = [...currData!, imgObj];

      try{
        const dbCollection = collection(firestore, 'Users');
        const docRef = doc(dbCollection, GlobalState.uid);
        await updateDoc(docRef, {photos: arrayUnion(imgObj)});
      }
      catch(error){
        console.log("Error with the arrayUnion: " + error);
      }
      console.log("Reaching RNFS")

    // Storing in RNFS

    let exists = await RNFS.exists(userDir);
    if(!exists){
      await RNFS.mkdir(userDir);
    }

  
    let urlLinks = [];
    try{
    const urlData = await RNFS.readFile(urlPath);
    urlLinks = JSON.parse(urlData);
    }
    catch(error){
      console.log("Error with the urls: " + error);
    }

    const links = [selfieURL, fullBodyURL];

    urlLinks = [...urlLinks, links];

    try{
      //Getting the file names at the end of the path
       const localSelfiePath = `${userDir}/${selfieName}`; 
       const localFullBodyPath = `${userDir}/${fullBodyName}`; 

       console.log("Here's the selfie path " + localSelfiePath);
       console.log("Here's the fullbody path " + localFullBodyPath);

     const[selfieResult, fullBodyResult] = await Promise.all([
           RNFS.downloadFile({fromUrl: selfieURL, toFile: localSelfiePath}).promise,
           RNFS.downloadFile({fromUrl: fullBodyURL, toFile: localFullBodyPath}).promise
      ]);

      console.log("Selfie status " + selfieResult.statusCode + " " + "full body status " + fullBodyResult.statusCode);

     }
    catch(error){
      console.log("Error: " + error);
    }

    console.log("Passed the DownloadFile area!");

   
    const files = await RNFS.readDir(userDir);
    if(files == null || !files || files.length === 0){
      console.log("Files is null");
    }
    else{
      console.log("Files isn't null");
    }


    try{
      console.log("Before the storage data!");

      //Extracting the file local path.
      const localStorageData = files.map(file => ({
        name: file.name,
        path: file.path,
      }));

      localStorageData.forEach(item => {
        console.log("This is the localStorage " + item.name + " " + item.path);
      });

    //  console.log("This is the local storage data " + localStorageData[0].name + " " + localStorageData[0].path);

      // Getting the selfie path.
      const selfieData = localStorageData.filter(item =>
          item.name === selfieName
      );
      // Getting the full body path.
      const fullBodyData = localStorageData.filter(item =>
          item.name === fullBodyName
      );

      // console.log("This is the selfieData length " + selfieData.length);
      // console.log("This is the fullbody length " + fullBodyData.length);

      // console.log("Here is the selfieDataPath " + selfieData[0].path);
      // console.log("Here is the fullBodyDataPath " + fullBodyData[0].path);

      const asyncImgObj:imageDataType = {selfie: selfieData[0].path, fullBody: fullBodyData[0].path, weight: weight, date: formattedDate, notes: notes, selfieName: selfieName, fullBodyName: fullBodyName}
      newImageData = [...imageData!, asyncImgObj];
      

      console.log("made it to the async storage area. Here's the UID: " + GlobalState.uid);
    
      // await AsyncStorage.setItem(`${GlobalState.uid}`, JSON.stringify(newImageData));


      await RNFS.writeFile(objPath, JSON.stringify(newImageData), 'utf8');
      // await RNFS.writeFile(urlPath, JSON.stringify(urlLinks), 'utf8');

      // Deleting for testing
      // try{
      //   await AsyncStorage.clear();
      //   RNFS.unlink(userDir);
      // } 
      // catch(error){
      //   console.log("Error: " + error);
      // }
   
    }

    catch(error){
      console.log("Error: " + error);
    }


      setImageData(newImageData);
      // setStoringDone(true);
      
      // Setting the time to be able to take another picture to
      // after midnight the next day.
      const endTime = new Date();
      endTime.setHours(24, 0, 0, 0);
      
      const newDBCollection = await collection(firestore, 'Users');
      doc(newDBCollection, GlobalState.uid).update({
        endTime: Timestamp.fromDate(endTime),   
        actionAllowed: false
      });
      
      if(countDownRef.current !== null) return null;
    }

    const removeKeyboard = () =>{
      InteractionManager.runAfterInteractions(() => {
        Keyboard.dismiss(); 
        setKeyboardShow(false);
      })
    }

    const getFileSize = async (path: string) =>{
      try{
        const stat1 = await RNFS.stat(path);
        const sizeInBytes1 = stat1.size;

        console.log("This is the image size: " + sizeInBytes1);
      
      }
      catch (error){
        console.log("Error: " + error);
      }
    }

    useEffect(() => {
      if(email.current.length == 0){
          const setEmailCred = async () => {
            try{
              const dbCollection = collection(firestore, 'Users');
              const docRef = doc(dbCollection, GlobalState.uid);
              const docSnap = await getDoc(docRef);

              if(docSnap.exists()){
                const user = docSnap.data() as UserDataTypes;
                const userEmail = user?.email;  
                email.current = userEmail;
                console.log("Email was given " + email.current)
              }

          }
          catch(error){
            console.log("Error: " + error);
          }
        
        }

        setEmailCred();

      }
    }, [])


    const handleResetPassword = async () => {
      try{
        await sendPasswordResetEmail(auth, email.current);
        Alert.alert("Reset password email sent!");
      }
      catch(error){
        Alert.alert("Error", "There was an error. Please try again!", [{text: "Cancel", style: 'cancel'}, {text: "Retry", style: "default", onPress: () => handleResetPassword()}])
        console.log("Error: " + error)
      }
    }

    const handleLogout = async () => {
      try{
        await signOut(auth);
        setSelfiePath("");
        setFullbodyPath("");
         FastImage.clearDiskCache();
         FastImage.clearMemoryCache();
          setImageData(null);
         GlobalState.uid = "";
         GlobalState.email = "";
        navigation.navigate('Login');
      }
      catch(error){
        console.log("Error: " + error);
      }
    }

    const deleteFirebaseStorage = async (path: string) => {
      const fileRef = storage().ref(path);
      const res = await fileRef.listAll();

      res.items.forEach(async (item) => {
       await item.delete();
      });

      for (const folder of res.prefixes){
        await deleteFirebaseStorage(folder.fullPath);
      }

    };

    const deleteLocalStorage = async (path: string) => {
      const exists = await RNFS.exists(path);
      if(exists){
        try{
          RNFS.unlink(path)
        }
        catch(error){
          console.log("Error: " + error);
        }
      }
    }

    const handleDeleteAccount = async () => {
      
      const user = auth.currentUser

      if(user){
        try{
          const valid = await reauthenticate();
          
          if(valid){
              const dbCollection = await collection(firestore, 'Users');
              console.log("UID: " + GlobalState.uid)
              console.log("It was valid ")
            try{
              await deleteFirebaseStorage(`images/${GlobalState.uid}`);
              console.log("Firebase Storage Files sucessfully deleted");
            }
            catch(error){
              console.log("Firebase Storage deletion error: " + error);
            }
            try{
              await deleteLocalStorage(userDir);
              await deleteLocalStorage(objPath);
              await deleteLocalStorage(changedDataPath);
              await deleteLocalStorage(subInfoPath);
              console.log("Local Storage Files sucessfully deleted");
            }
            catch(error){
              console.log("Local Storage deletion error: " + error);
            }
            
            
            const docRef = doc(dbCollection, GlobalState.uid);
            await deleteDoc(docRef);
            FastImage.clearDiskCache();
            FastImage.clearMemoryCache();
            setImageData(null);
            await deleteUser(user);
            navigation.navigate('Login');
            console.log("Account successfully deleted!");
          }
          else{
            Alert.alert("Error", "Invalid Credentials");
          }
        }
        catch(error){
          console.log("Can't delete account! Error: " + error);
        }
    }
    }


    const reauthenticate = async (): Promise<boolean> => {
      
       if(password){
          const credentials = EmailAuthProvider.credential(email.current, password);
          try{
            await reauthenticateWithCredential(auth.currentUser!, credentials)
            console.log("User reauthenticated");
            return true;
            
          }
          catch (error){
            console.log('Error: ' + error);
            
          }

       }

       return false;
    }

    const confirmNewWeight = async () => {
      if(newWeight.length < 2){
        Alert.alert("Please enter a valid weight!");
        return;
      }

      setGoalWeight(newWeight);

       try{
          const dbCollection = collection(firestore, 'Users');
          doc(dbCollection, GlobalState.uid).update({goalWeight: newWeight});
          sethasNewWeight(false);
          Alert.alert('Your new goal has been updated!');
          const changedData = {"unit": unit, "weight": newWeight}
          await RNFS.writeFile(changedDataPath, JSON.stringify(changedData), 'utf8');
          console.log("finished writing to RNFS with new goal!");

          const storedData = await RNFS.readFile(changedDataPath, 'utf8');
          console.log("Stored data after write:", storedData);

    // Optional: parse and sanity-check
    const parsed = JSON.parse(storedData);
    if (parsed.weight !== newWeight || parsed.unit !== unit) {
      console.warn("Mismatch between intended and stored data", { intended: changedData, parsed });
    }
          
       }
       catch(error){
         console.log('Error: ' + error);
       }
    }

    const confirmUnit = async () => {

    try{
        const dbCollection = collection(firestore, 'Users');
        doc(dbCollection, GlobalState.uid).update({unit: unit});
        setChangeUnit(false);
        Alert.alert("Unit updated!");
        const changedData = {"unit": unit, "weight": newWeight.length > 2 ? newWeight : goalWeight}
        await RNFS.writeFile(changedDataPath, JSON.stringify(changedData), 'utf8');
      }
      catch(error){
        console.log('Error: ' + error);
      }
    }
  
    return (
    <View style={{flex: 1}} onLayout={() => {
      // if(firstTime){
      //   tour.start();
      // }
    }}>
       {(!device || !hasPermission) && 
       <View style={{alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{fontSize: 20}}>Waiting for camera permissions...</Text>
        </View>
       }
      <Camera ref={cameraRef} onInitialized={() => setCameraReady(true)} style={StyleSheet.absoluteFill} device={device!} isActive={appState === 'active' && isFocused} photo={true} torch={(flip && snap) ? 'on' : 'off'}/>

      {!brighten ? <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss(); setShowAccount(false)}}>

          
           <View style={{flex: 1}}>
              {
              <View style={{position: 'absolute', width: '100%', height: '100%' }}> 
              <View style={{position: 'absolute', left: '20%', top: '15%'}}> 
                  <CopilotStep text="Main" order={1} name="Introduction" >
                    <WalkthroughableView style={{opacity: 0}}/>
                </CopilotStep>
              </View> 
              <View style={{position: 'absolute', left: '20%', top: '15%'}}>  
                  <CopilotStep text="Selfie" order={6} name="Selfie" >
                  <WalkthroughableView style={{opacity: 0}}/>
                </CopilotStep>
              </View>
              <View style={{position: 'absolute', left: '20%', top: '15%'}}>  
                  <CopilotStep text="Full Body" order={10} name="Full Body" >
                  <WalkthroughableView style={{opacity: 0}}/>
                </CopilotStep>
              </View>
              </View>
              }
            {confirmPassword ? 
              <View style={styles.confirmPasswordContainer}>
               
                <TouchableOpacity style={{zIndex: 1, position: 'absolute', left: 5, top: 5, width: 30, height: 30,
                 alignItems: 'center', justifyContent: 'center'}} onPress={() => setConfirmPassword(false)}>
                  <Text style={{fontSize: 18}}>X</Text>
                </TouchableOpacity>

                <View style={{alignItems: 'center', flexDirection: 'column', marginTop: 15 }}>
                <Text style={{fontSize: 15, marginTop: 10}}>Please confirm with your password</Text>
                <TextInput 
                ref={passwordRef}
                style={{fontSize: 17, borderWidth: 1, borderColor: 'grey', borderRadius: 15, width: 200, paddingLeft: 4, marginTop: 10,
              }} placeholder='Password' placeholderTextColor="grey" 
              secureTextEntry={true}
              onChangeText={text => setPassword(text)}/>
                <TouchableOpacity onPress={() => {
                  if(password.length >= 6){
                    handleDeleteAccount();
                  }
                  else{
                    Alert.alert('Alert', 'Please enter a valid password!')
                  }

                }}
                style={{marginTop: 15, width: 280, height: 40, alignItems: 'center', justifyContent: 'center'}}
                >
                  <Text style={{fontSize: 18, fontWeight: 500, color: '#1e90ff'}}>Confirm</Text>
                </TouchableOpacity>
                </View>
              </View> : null
          }


          {hasNewWeight ? 
          <View style={styles.confirmPasswordContainer}>

                <TouchableOpacity style={{zIndex: 1, position: 'absolute', left: 5, top: 5, width: 30, height: 30,
                  alignItems: 'center', justifyContent: 'center'}} onPress={() => sethasNewWeight(false)}>
                    <Text style={{fontSize: 18}}>X</Text>
                </TouchableOpacity>
                <View style={{alignItems: 'center', flexDirection: 'column', marginTop: 15 }}>
              <Text style={{fontSize: 15, marginTop: 10}}>Please enter your new goal weight</Text>

              <TextInput ref={weightRef} placeholder={unit!} placeholderTextColor='grey' style={styles.input}
               keyboardType='numeric' onChangeText={text => setNewWeight(text)} maxLength={5} />

              
              <TouchableOpacity onPress={confirmNewWeight}>
                <Text style={{fontSize: 18, fontWeight: 500, color: '#1e90ff'}}>Confirm</Text>
              </TouchableOpacity>
              </View>

          </View> 
          : 
          null}

          {changeUnit ? 
              <View style={{position: 'absolute', top: '50%', left: '22%', width: 300}}>
                 
                 <TouchableOpacity style={{zIndex: 1, position: 'absolute', top: 5, width: 30, height: 30,
                 alignItems: 'center', justifyContent: 'center', backgroundColor: 'grey', borderRadius: 20}} onPress={() => setChangeUnit(false)}>
                  <Text style={{fontSize: 18, textShadowColor: '#00ffff', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 2, 
                color: 'white', fontWeight: 700}}>X</Text>
                </TouchableOpacity>


              <View style={styles.measurementContainer}>
                  <TouchableOpacity style={unit === 'lb' ? styles.lbsSelected : styles.lbs} onPress={() => {
                    setUnit('lb')
                  }}>
                    <Text style={styles.text}>lb</Text>
                  </TouchableOpacity>
                 
                  <TouchableOpacity style={unit === 'kg' ? styles.kgsSelected : styles.kgs}
                  onPress={() => {
                    setUnit('kg')
                  }}>
                    <Text style={styles.text}>kg</Text>
                  </TouchableOpacity>
                 
              </View> 
                 <View style={{position: 'absolute', right: 80, top: 5.5}}>
                     <TouchableOpacity onPress={confirmUnit} style={changeUnit ? styles.okButton1 : styles.okButton2}>  
                            <Text style={styles.text}>Ok</Text>
                      </TouchableOpacity>
                </View> 
              </View>
          :
          null
          }

          {help ?
           <View style={{position: 'absolute', left: 50, top: '16%', height: 420, width: 300, backgroundColor: '#258c8cff', borderRadius: 20, 
           flexDirection: 'column', alignItems: 'center', paddingTop: 60}}>
               <TouchableOpacity style={{zIndex: 1, position: 'absolute', top: 10, left: 10, width: 30, height: 30,
                 alignItems: 'center', justifyContent: 'center'}} onPress={() => setHelp(false)}>
                  <Text style={{fontSize: 25, textShadowColor: '#00ffff', textShadowOffset: {width: 0, height: 0}, textShadowRadius: 2, 
                color: 'white', fontWeight: 700}}>X</Text>
                </TouchableOpacity>

                {/* <Image source={require('./helpMenu.jpg')} style={{height: 500, width: 320}}/> */}
                 <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingLeft: 2}}>
                  <Image source={require('./cbi.png')} style={{height: 20, width: 20}}/>
                  <Text style={styles.text1}>  Capture Button</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                   <View style={{borderRadius: 25, borderWidth: 1, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={styles.text1}>{username.substring(0,1)}</Text>
                    </View>
                    <Text style={styles.text1}>  Account/Settings</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                <Image source={require('./flashIcon.png')} style={{height: 20, width: 20, borderRadius: 20}}/>
                  <Text style={styles.text1}>  Flash Button</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                <Image source={require('./ipiW.jpg')} style={{height: 20, width: 20, borderRadius: 20}}/>
                  <Text style={styles.text1}>  Data Page Button</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                <Image source={require('./flipCameraImage.png')} style={{height: 20, width: 20, borderRadius: 20}}/>
                  <Text style={styles.text1}>  Flip Camera Button</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                 <Image style={{height: 20, width: 20, borderRadius: 15}} source={require('./notePadImage.png')}/>
                  <Text style={styles.text1}>  Daily Journal</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                 <Image style={{height: 20, width: 20, borderRadius: 15}} source={require('./cameraIcon.png')}/>
                  <Text style={styles.text1}>  Main Page Button</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                 <Image style={{height: 20, width: 20, borderRadius: 15}} source={require('./chartIcon.png')}/>
                  <Text style={styles.text1}>  Chart Page Button</Text>
                  </View>
                <View style={{flexDirection: 'row', alignItems: 'center', width: 260, paddingTop: 20, paddingLeft: 2}}>
                 <Image style={{height: 20, width: 20, borderRadius: 15}} source={require('./range.png')}/>
                  <Text style={styles.text1}>  Weight Range Button</Text>
                  </View>
            </View>
            :
            null}
         
          
            {(selfiePath && !nextPic) ? 
            <View style={styles.imageContainer} onLayout={() => {
              setRetakeReady(true);
              }}> 
                <Image source={{uri:selfiePath}} style={{height: '100%', width: '100%'}}/>
                    
                 <CopilotStep text="Retake" order={7} name="Retake" >
                  <WalkthroughableView style={styles.retakeButton}>
                      <TouchableOpacity onPress={() => {setSelfiePath(null)}}>
                        <Text style={styles.text}>Retake</Text>
                      </TouchableOpacity>
                    </WalkthroughableView>
                    </CopilotStep>

                    <CopilotStep text="Next" order={8} name="Next" >
                      <WalkthroughableView style={styles.nextButton}>
                        <TouchableOpacity onPress={() => setNextPic(true)}>
                          <Text style={styles.text}>Next</Text>
                        </TouchableOpacity>
                     </WalkthroughableView>
                    </CopilotStep>

                
              </View>
              : <View style={{flex: 1}}> 
              {(fullbodyPath) ? 
                    <View style={styles.imageContainer}> 
                        <Image source={{uri:fullbodyPath}} style={{height: '100%', width: '100%'}}/>
                        
                          <View style={styles.imageTextContainer1}>
                              <Text style={styles.text}>Weight</Text>
                              </View> 
                            <View style={styles.imageTextContainer2}>
                              <TextInput ref={inputRef} style={styles.textInputText} placeholder={unit!} keyboardType='numeric' maxLength={5} 
                              onChangeText={(text) => setWeight(text)}/>
                              <TouchableOpacity onPress={() => {
                                removeKeyboard()
                                setJournalReady(item => !item);
                              }}
                                 style={keyboardShow ? styles.okButton1 : styles.okButton2}>  
                                <Text style={styles.text}>Ok</Text>
                              </TouchableOpacity> 
                            </View>
                            <CopilotStep text='Journal' order={11} name='Journal'>
                              <WalkthroughableView style={{position: 'absolute', bottom: 50, left: '45%'}}>
                            <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center'}} onPress={() => setisNotes(note => !note)}>
                              <Image style={{width: 50, height: 50, borderRadius: 15,  borderWidth: 1, borderColor: '#00ffff'}} source={require('./notePadImage.png')}/>
                            </TouchableOpacity>
                            </WalkthroughableView>
                            </CopilotStep>
                            { (isNotes) ? 
                                // <View style={{flex: 1, position: 'absolute', 
                                // left: '13%', 
                                // top: '40%'}}>
                                <View style={{ height: 350, width: 400, position: 'absolute', top: '30%'}}>
                                  <TouchableOpacity style={{position: 'absolute', right: 50}} onPress={() => {
                                    setisNotes(false)
                                    Keyboard.dismiss()
                                  }
                                }>
                                    <Text style={styles.text}>Done</Text>
                                  </TouchableOpacity>
                                <TextInput
                                ref={noteRef}
                                multiline={true} placeholder='Daily Journal' 
                                style={styles.notePad}
                                placeholderTextColor={'grey'}
                                numberOfLines={3}
                                textAlignVertical='top'
                                value={notes}
                                onChangeText={(text) => setNotes(text)}
                                />
                               </View>
                                :
                                null
                            }
                          
                            <TouchableOpacity style={styles.retakeButton} onPress={() => {setFullbodyPath(null); setstartTime(false); setTimer(5)}}>
                              <Text style={styles.text}>Retake</Text>
                            </TouchableOpacity>
      
                            <TouchableOpacity style={styles.doneButton} onPress={storeData}>
                              <Text style={styles.text}>Done</Text>
                            </TouchableOpacity>
                        
                      </View>
                      : <View style={{flex: 1}} onLayout={() =>{  
                        setFullBodyReady(item => !item)
                        }}>
                        {(!startTime) ? 
                        <View style={{flex: 1}} > 
                        { !selfiePath ? 
                        <CopilotStep text='Data' order={4} name='Data Button'>
                        <WalkthroughableView style={styles.photoPageButtonContainer}>  
                          <TouchableOpacity onPress={() => navigation.navigate('Data', {imageData: imageData!})}>
                            <Image source={require('./ipiW.jpg')} style={{width: 40, height: 40, borderRadius: 15}}/>
                          </TouchableOpacity>
                        </WalkthroughableView>
                        </CopilotStep>
                         : null} 
                          
                          <View style={{width: '100%', height: 100}}>
                          <CopilotStep text="Flash" order={5} name='Flash Button'>
                            <WalkthroughableView style={flash ? styles.flashButtonContainerOn : styles.flashButtonContainerOff}>   
                                <TouchableOpacity onPress={() => {setFlash(flash => !flash)}} >
                                  <Image source={require('./flashIcon.png')} style={styles.flashButton}/>
                                </TouchableOpacity>
                            </WalkthroughableView>
                              </CopilotStep>
                          <View style={styles.cameraPageTextContainer}>
                              <Text style={styles.text}>Take a {!selfiePath ? "Selfie" : "Full Body Shot"}</Text>
                          </View>
                          
                          {selfiePath ? 
                          // <View style={{}} onLayout={() => setFullBodyReady(true)}>
                          <CopilotStep text= "Flip Camera" order={9} name='Flip Camera'>
                            <WalkthroughableView style={styles.flipCameraContainer}>
                            <TouchableOpacity onPress={() => setFlip(flip => !flip)}>
                            <Image source={require('./flipCameraImage.png')} style={styles.flipCameraButton}/>
                            </TouchableOpacity> 
                            </WalkthroughableView>
                          </CopilotStep>
                          // </View>
                          
                          : null}
                          </View>  

                          <CopilotStep text="Capture" order={2} name="Capture Button" >
                            <WalkthroughableView style={styles.buttonContainer}>
                            <View>                         
                            <TouchableOpacity style={styles.captureButton} onPress={selfiePath ? capturePhoto2 : capturePhoto1}>
                            <View/>
                            </TouchableOpacity>
                          </View>
                          </WalkthroughableView>
                        </CopilotStep>          

                        <CopilotStep text="Account" order={3} name="Account Button">
                        <WalkthroughableView style={{position: 'absolute', bottom: 55, left: 50}}> 
                          <TouchableOpacity onPress={() => setShowAccount(item => !item)} style={styles.accountButton}>
                            <Text style={styles.text}>{username.substring(0,1)}</Text>
                          </TouchableOpacity>
                        </WalkthroughableView>
                        </CopilotStep>

                       {showAccount ? 
                       <View style={styles.accountContainer}>

                          <TouchableOpacity style={styles.accountOption1} onPress={() => {
                            setChangeUnit(false);
                            sethasNewWeight(false);
                            setHelp(true);
                            setShowAccount(false)
                          }
                          }>
                            <Text style={{fontSize: 17}}>Help</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.accountOption1} onPress={() => {
                            setChangeUnit(true)
                            sethasNewWeight(false)
                            setShowAccount(false);
                          }
                          }>
                            <Text style={{fontSize: 17}}>Change Unit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.accountOption2} onPress={() => {
                            sethasNewWeight(true)
                            setChangeUnit(false)
                            setShowAccount(false);
                          }}>
                            <Text style={{fontSize: 17}}>New Goal?</Text>
                          </TouchableOpacity>

                              <TouchableOpacity style={styles.accountOption3} onPress={() =>{
                                setShowAccount(false);
                                Alert.alert('Reset Password', 'Are you sure you want to reset your password?',
                    [{
                        text: 'Cancel',
                        style: 'cancel'
                    }, {
                        text: 'Ok',
                        onPress: handleResetPassword,
                        style: 'default'
                    }]
                    
                    )}}>
                                <Text style={{fontSize: 17}}>Reset Password</Text>
                              </TouchableOpacity>
                              <TouchableOpacity  style={styles.accountOption4} onPress={ () => {
                                setShowAccount(false);
                                Alert.alert('Logout', 'Are you sure you want to Logout?',
                    [{
                        text: 'Cancel',
                        style: 'cancel'
                    }, {
                        text: 'Ok',
                        onPress: handleLogout,
                        style: 'default'
                    }])}}>
                                <Text style={{fontSize: 17}}>Logout</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.accountOption5}>
                                <Text style={{color: 'red', fontSize: 17}} onPress={() => {
                                setShowAccount(false);
                                Alert.alert('Delete Account', 'Are you sure you want to delete your account?',
                    [{
                        text: 'Cancel',
                        style: 'cancel'
                    }, {
                        text: 'Delete',
                        onPress: () => setConfirmPassword(true),
                        style: 'destructive'
                    }]
                    
                    )}}>Delete Account</Text>
                              </TouchableOpacity>
                          </View> : null}


                        
                        </View> : <View style={{flex: 1}}>
                                    <View style={styles.timerContainer}>
                                      <Text style={styles.timerText}>{timer}</Text>
                                    </View>
                                </View>}
              </View>}
              </View>}
      </View>
     
  </TouchableWithoutFeedback> : 
    <View style={{flex: 1, backgroundColor: 'white', opacity: 1}}>
        
    </View>
  }
  </View>
  )
  }

