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
    ViewToken,
    Alert
  } from 'react-native';
  import { RootStackParamList } from './StackList';
  import {NativeStackScreenProps} from '@react-navigation/native-stack';
  import {createUserWithEmailAndPassword, validatePassword, sendEmailVerification, signOut} from '@react-native-firebase/auth'
//   import UserCredential  from '@react-native-firebase/auth';
//   import { doc, setDoc } from "firebase/firestore";
  import { auth, firestore } from './Firebase.ts';
  import firebase from "@react-native-firebase/app";
  import {collection, getDocs, Timestamp, where, query, doc} from '@react-native-firebase/firestore'
  import {useState} from 'react'
  import { GlobalState } from './GlobalState.ts';
// import { stat } from 'fs';

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
    },
    signUpText: {
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
        // textShadowColor: "#00ffff",
        // textShadowRadius: 3,
        // textShadowOffset: {width: 0, height: 0},
    },
    textInput: {
        fontSize: 15,
        color: "black",
        backgroundColor: 'white',
        width: 300,
        height: 50,
        borderRadius: 10,
        marginBottom: 30,
        paddingLeft: 15
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

  type Prop = NativeStackScreenProps<RootStackParamList, 'SignUp'>

  export const SignUp = ({navigation}: Prop): React.JSX.Element => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUserName] = useState(''); 
    
    
    
    // Creates the user info in firebase auth and firestore database.
    const createUser = async () => {
        try{

            const userCredentials = createUserWithEmailAndPassword(auth, email, password);
            console.log("Made it here with the sign up!");
            const user = (await userCredentials).user;
            
            const dbCollection = await collection(firestore, 'Users')
            doc(dbCollection, user.uid)
            .set({
              uid: user.uid,
              username: username.length === 0 ? 'Guest' : username,
              photos: [],
              endTime: Timestamp.fromDate(new Date()),
              email: email,
              completedOnboard: false,
              reasons: '',
              goalWeight: '',
              unit: 'lb',
              paid: false
            });

            sendEmailVerification(user).then(() => {
                Alert.alert("Email verfication sent!");
            }).catch(error => {
                console.log("Error with verification: " + error);
                Alert.alert("Error", "There was a verification error. Please try again!", [{text: "Cancel", style: 'cancel'}, {text: "Retry", style: "default", onPress: () => sendEmailVerification(user)}]);
            });

            // GlobalState.email = email;
            // GlobalState.uid = user.uid;
            await signOut(auth);
            navigation.navigate('Login');  
        }   
        catch (error) {
                if(error?.toString().includes('auth/email-already-in-use')){
                    Alert.alert("Error", "Email already in use. Login!");
                }
                if(error?.toString().includes('[auth/invalid-email] The email address is badly formatted.')){
                    Alert.alert("Error", "Please enter a valid email of the format example@example.com! ");
                }
                else{
                    console.log(error);
                }
        }
    }

    // Validates the password and other credentials before creating the user.
    const handleSignUp = async () => {
        const status = await validatePassword(auth, password);

         if(password.length < 6){
            Alert.alert("Error", "Password too short! Must be at least 6 characters!");
            return;
        }
        else if(!status.isValid){
            if(!status.containsLowercaseLetter){
                Alert.alert("Error", "Password must contain a lowercase letter!");
                return;
            }
            if(!status.containsUppercaseLetter){
                Alert.alert("Error", "Password must contain an uppercase letter!");
                return;
            }
            if(!status.containsNumericCharacter){
                Alert.alert("Error", "Password must contain a number!");
                return;
            }
            if(!status.containsNonAlphanumericCharacter){
                Alert.alert("Error", "Password must contain a non-alphanumeric character!");
                return;
            }
        }
        else if(password !== confirmPassword){
            Alert.alert("Error", "Passwords do not match!");
            return;
        }
        else if(username.length === 0){
            Alert.alert("Error", "Please enter a Username");
            return;
        }

        await createUser();
    }


    return(
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
            
                    <View style={styles.credentialsContainer}>
                    <Text style={styles.signUpText}>Sign Up</Text>
                    <TextInput value={email} placeholder='Email' style={styles.textInput} placeholderTextColor={'grey'} onChangeText={text => setEmail(text)} />
                    <TextInput value={username} placeholder='Username' style={styles.textInput} placeholderTextColor={'grey'} onChangeText={text => setUserName(text)} />
                    <TextInput value={password} placeholder='Password' style={styles.textInput} autoCorrect={false} secureTextEntry={true} placeholderTextColor={'grey'} onChangeText={text => {
                        setPassword(text)
                    }}/>
                    <TextInput value={confirmPassword} placeholder='Confirm Password' style={styles.textInput} secureTextEntry={true} placeholderTextColor={'grey'} onChangeText={text => setConfirmPassword(text)}/>
                    </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
                <Text style={styles.text}>Sign Up</Text>
            </TouchableOpacity>
           
            <View style={{flexDirection:"row"}}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{color: 'blue'}} >Login</Text>
            </TouchableOpacity> 
             </View>

            
        </View>
        </TouchableWithoutFeedback>
    )
  }