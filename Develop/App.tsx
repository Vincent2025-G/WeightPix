/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect, useRef, useContext} from 'react';

import type {PropsWithChildren} from 'react';
import { NavigationContainer, ThemeContext, createStaticNavigation, useNavigation, CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList } from './StackList';
import { HomeScreen } from './Home';
import { SecondPage } from './SecondPage';
import { ChartPage } from './ChartPage';
import {Login} from './Login'
import { SignUp } from './SignUp';
import { Onboard1 } from './Onboard1.tsx';
import { Onboard2 } from './Onboard2.tsx';
import { Payment } from './Payment.tsx';
import {imageDataType} from './StackList';
import {auth, firestore} from './Firebase.ts'
import { onAuthStateChanged } from '@react-native-firebase/auth';
import {collection, doc, getDoc, Timestamp} from '@react-native-firebase/firestore'
import 'react-native-charts-wrapper';
import { GlobalState } from './GlobalState.ts';
import {View, ActivityIndicator} from 'react-native'
import  PushNotificationIOS  from '@react-native-community/push-notification-ios';
// import Toast from 'react-native-toast-message'
import { Platform } from 'react-native';
import {format} from 'date-fns'

import {CopilotProvider} from 'react-native-copilot'
import { TooltipComponent, StepNumberComponent } from './CopilotTooltip.tsx';
import { UserDataProvider, UserData } from './UserData.tsx';
import { getSubscriptions } from 'react-native-iap';
import { withIAPContext } from 'react-native-iap';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

 

function App(): React.JSX.Element {

  const Stack = createNativeStackNavigator<RootStackParamList>();
  const [allowedAccess, setAllowedAccess] = useState<boolean | null>(null);   
  const [tookPicture, setTookPicture] = useState(false);
  const [userSignedIn, setUserSignedIn] = useState<boolean | null>(null);
  const [completedOnboard, setCompletedOnboard] = useState<boolean | null>(null);
  const [initialNavReady, setInitialNavReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  // const {completedOnboard, setCompletedOnboard} = useContext(UserData);
  interface UserDataTypes{
    photos: imageDataType[],
    endTime: Timestamp, 
    completedOnboard: boolean
  }

  const navigationRef = createNavigationContainerRef();
 
  useEffect(() => {
    console.log('completedOnboard:', completedOnboard);
  }, [completedOnboard]);  

  useEffect(() => {  
    const check = onAuthStateChanged(auth, user => {
      if(user){
        console.log("Signed in");
        setUserSignedIn(true);
        GlobalState.uid = user.uid
      }
      else{
        setUserSignedIn(false);
      }
    })

    return () => check();
  }, [])

  // useEffect(() => {
  //   const getDataLength = async () => {
  //     const dbCollection = collection(firestore, 'Users');
  //     const docRef = doc(dbCollection, GlobalState.uid);
  //     const docSnap = await getDoc(docRef);
  //     if(docSnap.exists()){
  //       const user = docSnap.data;
        
  //     }
  //   }

  //   getDataLength();

  // }, [])

  
  useEffect(() => {
    
    const checkTime = async () => {
      try{

        const dbCollection = collection(firestore, 'Users'); 
        const docRef = doc(dbCollection, GlobalState.uid);
        const docSnapShot = await getDoc(docRef); 
        if(docSnapShot.exists()){
          const data = docSnapShot.data() as UserDataTypes;
          
          console.log(data?.endTime + " This is the endtime!");
          if(data?.endTime instanceof Timestamp){

            const end = data?.endTime.toDate().getTime() 
            updateTime(end)
          }
          else{
            console.log("Didn't work");
          }
        }
      }
      catch(error){
        console.log("Error: " + error);
      }
    }
    checkTime(); 
  }, [userSignedIn]);   

  const updateTime = (end: number) => {

    const interval = setInterval(() => {
          const now = Date.now();
          const diff = Math.max(0, (end - now));
          
          if(diff === 0){    
            // console.log(" This is the diff value " + diff);
            setAllowedAccess(true)
            clearInterval(interval)
            
          }
          else{
            setAllowedAccess(false);
          }  
        }, 1000)
    }

    useEffect(() => {
      
      const checkIfOnboard = async () => {
        try{
          const dbCollection = collection(firestore, 'Users'); 
          const docRef = doc(dbCollection, GlobalState.uid);
          const docSnapShot = await getDoc(docRef); 

          if(docSnapShot.exists()){
            const user = docSnapShot.data() as UserDataTypes;
            console.log(user?.completedOnboard + " onboard?")
            if(user?.completedOnboard === true){
              console.log(" Yes completed onboard is: " + user?.completedOnboard);
              setCompletedOnboard(true);
            }
            else{
              setCompletedOnboard(false);
            }
          }
        }
        catch(error){
        }
      }

      checkIfOnboard()  
    }, [userSignedIn, completedOnboard])

   
 
  

  useEffect(() => {
    PushNotificationIOS.requestPermissions({alert: true, sound: true, badge: true}).then((permission) => {

      // Checking if the user took the picture and if so change took picture to true so no 
      // notification will be sent.
     const checkIfPicture = async () => {
        try{

          console.log("Checking if the user took a picture!");
          const dbCollection = collection(firestore, 'Users'); 
          const docRef = doc(dbCollection, GlobalState.uid);
          const docSnap = await getDoc(docRef); 

          if(docSnap.exists()){
            const user = docSnap.data() as UserDataTypes;
            if(user?.photos.length > 0){
              const photos = user?.photos;
              GlobalState.dataLength = photos.length
              const lastPhoto = photos[photos.length - 1];

              // Ensuring the format is the same for accurate comparison
              const now = format(new Date(), 'MM/dd/yy');
              
              if(lastPhoto.date == now){
                console.log(photos[photos.length - 1].date + " Date works")
                setTookPicture(true);
              }
              else{
                console.log("Hasn't taken picture");
                if(permission.alert){
                  scheduleNotifications()
                }
              }
             
            }
          }
        }
        catch(error){
          console.log('error ' + error);
        }
     }
 
      checkIfPicture();
    
    })
  
  }, [])


  const scheduleNotifications = () => {
    console.log("Schedule Notification works!");
    const now = new Date();
    const newTime = new Date();
    newTime.setHours(16, 0, 0, 0); 

    // Making sure that if the time has already passed then set a reminder
    // for the next day. So it will trigger for the next day even if they
    // don't open the app again.
    if(now > newTime){
      newTime.setDate(newTime.getDate() + 1);
    }

    PushNotificationIOS.addNotificationRequest({
      id: 'photoReminder',
      title: 'Reminder',
      body: "Don't forget to take your photos today!",
      fireDate: newTime
    });
  }


useEffect(() => {
  
  console.log(userSignedIn + " " + allowedAccess +  " " + completedOnboard);
  if(userSignedIn && completedOnboard){
      console.log("First is data!");
      setInitialRoute('Data');
  }
  else if(completedOnboard === false && userSignedIn){
    console.log("First is Onboard!");
   setInitialRoute('Onboard1')
  }
  else if(userSignedIn && completedOnboard === true && allowedAccess === true){
    console.log("First is Home!");
    setInitialRoute('Home') 

  }  
   else if(userSignedIn === false){ 
    console.log(" Defaulted to login");
    setInitialRoute('Login')
  }

}, [userSignedIn, completedOnboard, allowedAccess])

if(initialRoute === null){
  return( <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'}}>
        {/* Loading icon */}
         <ActivityIndicator size="large" color="#00ffff"/>
       </View>)
}  


  return(
    <UserDataProvider>
      <GestureHandlerRootView>
    <CopilotProvider>
    <NavigationContainer ref={navigationRef}> 
  <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, gestureEnabled: false }}>
    
    <Stack.Screen name="Home" component={HomeScreen}
    
    />
   
     
     <Stack.Screen name="Data" component={SecondPage}/>
     <Stack.Screen name="ChartPage" component={ChartPage}/>
     
   

        <Stack.Screen name="Onboard1" component={Onboard1}/>
        <Stack.Screen name="Onboard2" 
      //   children={(props) => (
      //     <Onboard2 {...props} setCompletedOnboard={completedOnboard}/>
      // )}
      component={Onboard2}
      /> 
      

    

     <Stack.Screen name="Login" component={Login}/>
     <Stack.Screen name="SignUp" component={SignUp}/>

    <Stack.Screen name="Payment" component={Payment}/>
  
    
   </Stack.Navigator>
    </NavigationContainer> 
    </CopilotProvider>
    </GestureHandlerRootView>
    </UserDataProvider>
    
  )
  }

export default withIAPContext(App);
