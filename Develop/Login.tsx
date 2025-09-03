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
    Animated,
    DevSettings,
    Alert,
    Platform
  } from 'react-native';
  import { RootStackParamList } from './StackList';
  import {NativeStackScreenProps} from '@react-navigation/native-stack'; 
//   import {getAuth, signInWithEmailAndPassword, sendPasswordResetEmail} from 'firebase/auth'
  import { auth, firestore } from './Firebase.ts';
  import {collection, doc, getDoc, updateDoc, Timestamp} from '@react-native-firebase/firestore'
  import {useState, PropsWithChildren, useContext, useEffect} from 'react'
  import {UserData} from './UserData.tsx'
  import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut } from '@react-native-firebase/auth';

import {useIAP, getReceiptIOS} from 'react-native-iap'

import {GlobalState} from './GlobalState.ts';
import FastImage from 'react-native-fast-image';
import * as RNFS from '@dr.pogodin/react-native-fs';
import {useCheckSubscriptionInfo} from './subscriptionCheck';
import { imageDataType } from './StackList';
import {isTablet} from 'react-native-device-info';

  

  const styles = StyleSheet.create({
    pageContainer:{
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#359EA0',
    flexDirection: 'column'
    },
    loginContainer:{
        height: 400,
        width: 350,
        alignItems: 'center', 
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 15,
        backgroundColor: 'grey',
        flexDirection: "column"
    },
    credentialsContainer:{
        alignItems: 'center', 
        marginTop: 60
    },
    titleText1: {
        fontSize: 40,
        fontWeight: 700,
        color: "white",
        // textShadowColor: "#00ffff",
        // textShadowRadius: 3,
        // textShadowOffset: {width: 0, height: 0},
        position: 'absolute',
        left: !isTablet() ? '21%' : '38%',
        top: !isTablet() ? 60 : 205
    },
    titleText2: {
        fontSize: 40,
        fontWeight: 700,
        color: "white",
        // textShadowColor: "#00ffff",
        // textShadowRadius: 3,
        // textShadowOffset: {width: 0, height: 0},
        position: 'absolute',
        left: !isTablet() ? '26%' : '40%',
        top: !isTablet() ? 105 : 250
    },
    loginText: {
        fontSize: 30,
        fontWeight: 700,
        color: "white",
        // textShadowColor: "#00ffff",
        // textShadowRadius: 3,
        // textShadowOffset: {width: 0, height: 0},
        marginBottom: 20
    },
    text: {
        fontSize: 20,
        fontWeight: 600,
        color: "white",
       
    },
    textInput: {
        fontSize: 15,
        color: "black",
        backgroundColor: 'white',
        width: 300,
        height: 50,
        borderRadius: 10,
        marginBottom: 30,
        paddingLeft: 15,
       
    },
    loginButton:{
        width: 300,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50, 
        backgroundColor: '#00ffff',
        marginBottom: 20
    }
  })

  

  type Prop = NativeStackScreenProps<RootStackParamList, 'Login'>

  export const Login = ({navigation}: Prop): React.JSX.Element => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {imageData, setImageData, setGoalWeight, setUnit} = useContext(UserData);
    // const{connected, purchaseHistory, getPurchaseHistory} = useIAP();
    // const subscriptionSkus = Platform.select({ios: ['wj.test1']}); 
    const {checkLocal} = useCheckSubscriptionInfo();

    
    interface UserDataTypes{
        expirationDate: Timestamp,
        completedOnboard: boolean,
        photos: imageDataType[]
    }

    // navigation.navigate("Payment");
    // useEffect(() => {
    //     setImageData([]);
        
    //     const setName = async () => {
    //         const name = await DeviceInfo.getDeviceId();
    //         setDeviceName(name);
    //     }

    //     setName();
    // }, [])

    useEffect(() => {
        const clear = () => {
            console.log("Login page imageData " + imageData)
            FastImage.clearDiskCache();
            FastImage.clearMemoryCache();
            setImageData(null);
            setGoalWeight(null);
            setUnit('lb');
            
        }
       
        clear();
    }, [])

    const handleResetPassword = async () => {
       
        try{
          await sendPasswordResetEmail(auth, email);
          Alert.alert('Email Sent');
        }
        catch(error){
            Alert.alert("Error", "There was an error. Please try again!", [{text: "Cancel", style: 'cancel'}, {text: "Retry", style: "default", onPress: () => handleResetPassword()}]);
          console.log("Error: " + error);
        }
    }

    const handleLogin = async () =>{
        try{
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredentials.user;

            // if(!user.emailVerified){
            //                 console.log("User hasn't verified their email!");   
            //                 Alert.alert("Alert", "Please verify your email to login!", [{text: "Cancel", style: "cancel"}, {text: "Verify", style: "default", onPress: () => {
            //                      sendEmailVerification(user).then(() => {
            //                 Alert.alert("Email verfication sent!");
            //                 }).catch(error => {
            //                     console.log("Error with verification: " + error);
            //                     Alert.alert("Error", "There was a verification error. Please try again!", [{text: "Cancel", style: 'cancel'}, {text: "Retry", style: "default", onPress: () => sendEmailVerification(user)}]);
            //                 });
            //                 }}]);
            //                 await signOut(auth);
            //                 // return;

            // }
                let photoLength = 0;

                try{
                      const dbCollection = collection(firestore, 'Users'); 
                      const docRef = doc(dbCollection, GlobalState.uid);
                      const docSnapShot = await getDoc(docRef); 
            
                      if(docSnapShot.exists()){
                        const user = docSnapShot.data() as UserDataTypes;
                        console.log(user?.completedOnboard + " onboard?")
                        photoLength = user?.photos.length;
                        if(user?.completedOnboard === true){
                          console.log(" Yes completed onboard is: " + user?.completedOnboard);
                          
                        }
                        else{
                             navigation.navigate("Onboard1");
                             console.log("Haven't completed onbaord");
                             return;
                        }
                      }
                    }
                    catch(error){
                        console.log("Error fetching onboard status: " + error);
                    }

              

            GlobalState.uid = user.uid;
            GlobalState.dataLength = photoLength
            const userDir = `${RNFS.DocumentDirectoryPath}/${user.uid}`;
            const subInfoPath = `${userDir}/subInfo`;
            console.log("subInfoPath: " + subInfoPath);
            console.log("Photo length: " + photoLength);
           
            checkLocal(subInfoPath, photoLength);

            // navigation.navigate('Home');
        }
        catch(error){
            Alert.alert('Error', 'Invalid credentials!');
        }   
    }

    
    

    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
             <Text style={styles.titleText1}>Welcome To </Text>
             <Text style={styles.titleText2}>WeightPix</Text>           
            
                    <View style={styles.credentialsContainer}>
                    <Text style={styles.loginText}>Login Here</Text>
                    <TextInput placeholder='Email' style={styles.textInput} placeholderTextColor={'grey'} onChangeText={text => setEmail(text)}/>
                    <TextInput placeholder='Password' style={styles.textInput} secureTextEntry={true} placeholderTextColor={'grey'} onChangeText={text => setPassword(text)}/>
                    </View>

                    <View style={{flexDirection:"row", marginBottom: 80, marginRight: !isTablet() ? 55 : 260, alignSelf: 'flex-end'}}>
            
            <TouchableOpacity onPress={() => {
                if(email.length < 4){
                    Alert.alert('Alert', 'Please enter a valid email.')
                }
                else{
                    handleResetPassword()
                }
            }
                
                }>
                <Text style={{color: 'blue'}}>Forgot Password?</Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.text}>Login</Text>
            </TouchableOpacity>
           
            <View style={{flexDirection:"row"}}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={{color: 'blue'}}>Sign Up</Text>
            </TouchableOpacity>
            </View>
            
           
            
            
        </View>
        </TouchableWithoutFeedback>
    )
  }