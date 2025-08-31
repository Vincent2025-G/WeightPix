// import { LineChart } from 'react-native-chart-kit';
// import ECharts from 'react-native-echarts-wrapper';
import {LineChart} from 'react-native-charts-wrapper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList, imageDataType } from './StackList';
import React, {useContext, useEffect, useRef, useState, useCallback} from 'react'
import {collection, doc, getDoc, Timestamp} from '@react-native-firebase/firestore'
import { auth, firestore } from './Firebase.ts';
import { UserData } from './UserData.tsx';
import * as RNFS from '@dr.pogodin/react-native-fs';
let userDir = `${RNFS.DocumentDirectoryPath}/${GlobalState.uid}`;
let changedDataPath = `${userDir}/changeddata.json`;
import {format} from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import {ScaledSheet} from 'react-native-size-matters'
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
    Dimensions, 
    processColor, 
    ActivityIndicator,
    findNodeHandle,
    UIManager
  } from 'react-native';
import { isEnabled } from 'react-native/Libraries/Performance/Systrace';
import { GlobalState } from './GlobalState';
import {isTablet} from 'react-native-device-info';
// import { parse } from 'path';


  const styles = ScaledSheet.create({
     pageContainer: {
        alignItems: 'center', 
        justifyContent: 'center',
         backgroundColor: 'black',
        flex: 1
     },
     lineChart: {
      height: !isTablet() ? '290@mvs0.1' : '500@mvs0.1',
       width: !isTablet() ? '350@ms0.1' : '505@ms0.1',
       backgroundColor: 'black',
      borderRadius: 15,
        marginTop: 10,
        padding: 18,
        borderColor: '#00ffff', 
        borderWidth: 1
     },
     mainContainer: {
      alignItems: "center", marginTop: !isTablet() ? '170@s' : '140@s'
     },
     returnButtonContainer:{
        position: 'absolute',
        left: !isTablet() ? 30 : 80,
        top: !isTablet() ? 100 : 180
     },
     smallerText: {
        fontSize: !isTablet() ? 20 : 23,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: '#00ffff',
        textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
        textShadowRadius: 3, // Controls how far the shadow blurs out.
    },
     text: {
        fontSize: !isTablet() ? 25 : 35,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: '#00ffff',
        textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
        textShadowRadius: 3, // Controls how far the shadow blurs out.
    },
     textInputText:{
     fontSize: !isTablet() ? 25 : 35,
     color: 'white',
     fontWeight: 'bold',
     textShadowColor: '#00ffff',
     textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
     textShadowRadius: 2, // Controls how far the shadow blurs out.
     textAlign: 'center'
   },
     goalText: {
        fontSize: !isTablet() ? 20 : 23,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: '#00ffff',
        textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
        textShadowRadius: 3, // Controls how far the shadow blurs out.
        
    },
    arrowButton: {
      color: 'white', 
      fontSize: !isTablet() ? '35@s' : '30@s',
      textShadowColor: '#00ffff',
      textShadowOffset: {width: 0, height: 0}, // Defines the position of shadow (0,0 in center)
      textShadowRadius: 3, 
    },
    arrowContainer: {
      flexDirection: 'row', gap: 70, width: 250, alignSelf: 'center', justifyContent: 'center', height: '45@vs', marginBottom: '5@s'
    },
    exitButton1:{
     position: 'absolute',
    left: !isTablet() ? '48@s' : '100@s',
    top: !isTablet() ? 155 : 275,
    opacity: 1,
    alignItems: 'center',
    backgroundColor: 'grey',
    marginLeft: 5,
    borderRadius: 20,
    width: 40,
   },
   exitButton2:{
    position: 'absolute',
   left: !isTablet() ? '48@s' : '100@s',
    top: !isTablet() ? 155 : 275,
     opacity: 0,
    alignItems: 'center',
    backgroundColor: 'grey',
    marginLeft: 5,
    borderRadius: 20,
    width: 40,
   },
    exitButton3:{
     position: 'absolute',
    left: !isTablet() ? 15 : 140,
    top: !isTablet() ? 155 : 275,
    opacity: 1,
    alignItems: 'center',
    backgroundColor: 'grey',
    marginLeft: 5,
    borderRadius: 20,
    width: 40,
   },
   exitButton4:{
    position: 'absolute',
      left: !isTablet() ? 15 : 140,
    top: !isTablet() ? 155 : 275,
     opacity: 0,
    alignItems: 'center',
    backgroundColor: 'grey',
    marginLeft: 5,
    borderRadius: 20,
    width: 40,
   },
    searchContainer: {
      position: 'absolute', 
      top: !isTablet() ? 150 : 270, 
      left: !isTablet() ? 105 : 300,
      flexDirection: 'row', 
      borderWidth: 1, 
      borderColor: "#00ffff", 
      borderRadius: 15,
      width: !isTablet() ? '152@s' : '90@s', 
      height: !isTablet() ?  40 : 60, 
      alignItems: 'center',
      padding: 5
    },
    searchContainer2: {
      position: 'absolute', 
      top: !isTablet() ? 150 : 270, 
      left: !isTablet() ? 65 : 200,
      flexDirection: 'row', 
      borderWidth: 1, 
      borderColor: "#00ffff", 
      borderRadius: 15,
      width: !isTablet() ? '223@s' : '180@s', 
      height: !isTablet() ?  40 : 60, 
      alignItems: 'center',
      padding: 5
    },
    mgiStyle: {
      height: !isTablet() ? 25 : 40,
      width: !isTablet() ? 25 : 40,
      marginRight: isTablet() ? 15 : 0
    },
    rangeButton1:{
     borderColor: '#00ffff',
     borderWidth: 2,
     borderRadius: 5,
     width: !isTablet() ? 40 : 60,
     height: !isTablet() ? 35 : 55,
     position: 'absolute',
     right: !isTablet() ? 65 : 230,
     top: !isTablet() ? 153 : 273,
     alignItems: 'center',
     justifyContent: 'center'
   },
   rangeButton2:{
     borderColor: '#00ffff',
     borderWidth: 2,
     borderRadius: 5,
    width: !isTablet() ? 40 : 60,
     height: !isTablet() ? 35 : 55,
     position: 'absolute',
    right: !isTablet() ? '25@s' : '55@s',
     top: !isTablet() ? 153 : 273,
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: '#00ffff',
     shadowOffset: {width: 0, height: 0},
     shadowRadius: !isTablet() ? 8 : 12,
     shadowOpacity: 1
   },
   chartButtons: {
    width: '50@s', alignItems: 'center', justifyContent: 'center', height: '50@vs'
   },
   timeSpanContainer: {
      height: 40,
      borderRadius: 5, 
      flexDirection: 'row'
   }, 
   timeSpan: {
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ffff',
    width: 40,
    height: 40, 
   },
   timeSpanSelected: {
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ffff',
    width: 40,
    height: 40, 
    backgroundColor: '#00ffff'
   },
   timeSpanLeftEnd: {
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ffff',
    width: 40,
    height: 40, 
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
   },
   timeSpanLeftEndSelected: {
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ffff',
    width: 40,
    height: 40, 
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    backgroundColor: '#00ffff'
   },
   timeSpanRightEnd: {
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ffff',
    width: 40,
    height: 40, 
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
   },
   timeSpanRightEndSelected: {
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00ffff',
    width: 40,
    height: 40, 
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: '#00ffff'
   }
  })

  

  type Props = NativeStackScreenProps<RootStackParamList, 'ChartPage'>

  export const ChartPage = ({navigation, route}: Props): React.JSX.Element => {

    interface UserDataTypes{
      unit: string, 
      goalWeight: string
    }
  
  

    const {imageData, goalWeight, setGoalWeight, unit, setUnit} = useContext(UserData);


    useEffect(() => {
       const uid = GlobalState.uid
       userDir = `${RNFS.DocumentDirectoryPath}/${uid}`;
       changedDataPath = `${userDir}/changeddata.json`;

       console.log("UID: " + uid);
       console.log("UserDir: " + userDir);
       console.log("Changed Path: " + changedDataPath)
    }, [])
    

    useFocusEffect(
      useCallback(() =>  {
      const setData = async () => { 
          // console.log("UID: " + GlobalState.uid);
          const storedData = await RNFS.readFile(changedDataPath, 'utf8');
          console.log("Stored data! " + storedData)
          if(storedData != null){
             const parsedData = JSON.parse(storedData);
             if(parsedData.weight && parsedData.unit){
              setUnit(parsedData.unit);
              setGoalWeight(parsedData.weight);

              console.log("entered storeData Unit: " + parsedData.unit + " GoalWeight: " + parsedData.weight)
             }
          } 
        }
    
        setData();
      }, [GlobalState.uid])
    
    )

    // const {imageData} = route.params;
    
    const [dataLoaded, setDataLoaded] = useState(false);
    
    useEffect(() => {
      if(goalWeight === null || unit === null || goalWeight.length < 1){
        console.log("Chart data retrieved!");
      const getData = async () => {
        try{
          const dbCollection = collection(firestore, 'Users'); 
          const docRef = doc(dbCollection, GlobalState.uid);
          const docSnap = await getDoc(docRef); 

         if(docSnap.exists()){
          const user = docSnap.data() as UserDataTypes;
          setUnit(user?.unit);
          setGoalWeight(user?.goalWeight);
          setDataLoaded(true);
         }

         console.log(unit);
      }
      catch(error){
        console.log("Error: " + error);
      }
    }
    getData()
  }
      
    }, [])

    useEffect(() => {
      if(goalWeight){
        setDataLoaded(true);
      }
    })

    const [reversedList, setReversedList] = useState<imageDataType[]>([]);
  
    useEffect(() => {
      if(imageData != null && imageData.length > 0){
        setReversedList([...imageData!]);
        setReversedList(item => item.reverse());
      }
 
    }, [])

        const chartRef = useRef<any>(null);
 
        const [month, setMonth] = useState('');
        const [month1, setMonth1] = useState('');
        const [month2, setMonth2] = useState('');
        const [year, setYear] = useState('');
        const [year1, setYear1] = useState('');
        const [year2, setYear2] = useState('');
        const monthRef = useRef<RNTextInput>(null);
        const monthRef2 = useRef<RNTextInput>(null);
        const yearRef = useRef<RNTextInput>(null);
        const yearRef2 = useRef<RNTextInput>(null);
        const [validSearch, setValidSearch] = useState(true);
        const [filteredImageData, setFiltered] = useState<imageDataType[]>(imageData ?? []);
        const [rangeSelected, setRangeSelected] = useState(false);
        const [search, setSearch] = useState(false);

        

      useEffect(() => {
        if(month1 || year1 || month2 || year2){
              setSearch(true);
               setValidSearch(false);
               setFiltered([]);
              if(month1.length === 2 && year1.length === 2 && month2.length === 2 && year2.length === 2){
               const startMonth = month1.toString().trim()[0] === '0' ? month1.toString()[1] : month1.toString();
               const startYear = year1.toString().trim()[0] === '0' ? year1.toString()[1] : year1.toString();
               const endMonth = month2.toString().trim()[0] === '0' ? month2.toString()[1] : month2.toString();
               const endYear = year2.toString().trim()[0] === '0' ? year2.toString()[1] : year2.toString();
        
        
               const newData = route.params.imageData!.filter((item: imageDataType) => {
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
              setSearch(true)
               const newData = route.params.imageData!.filter((item: imageDataType) =>
               item.date.substring(0,2).trim() === month.toString().trim() &&
               item.date.substring(6,8).trim() === year.toString().trim()
             ) 
               setFiltered(newData);
               if(newData.length == 0){
                
                 setValidSearch(false);
               }
               else{
                setSearch(false);
                 setValidSearch(true);
               }
             }
            
             else{
               setSearch(false);
               setValidSearch(true);
               setFiltered(route.params.imageData!);
             }
      }, [month, month1, month2, year, year1, year2]);

      const removeKeyboard = () =>{
           InteractionManager.runAfterInteractions(() => {
             Keyboard.dismiss();
           })
          
         }

  const exitSearch = () => {
     removeKeyboard();
    setSearch(false);
      setMonth('');
     setYear('')
     setMonth1('')
     setYear1('')
     setMonth2('')
     setYear2('')
     setRangeSelected(false);
     setFiltered(route.params.imageData!);
   }
       
        
    

    const [min, setMin] = useState(0)
    const [max, setMax] = useState(0)

    useEffect(() => {
      if(filteredImageData != null){
        setMin(filteredImageData!.length - 30);
        setMax(filteredImageData!.length - 1);
      }
    }, [filteredImageData])
  

    const goBack = () => {
      console.log("Min: " + min + " Max: " + max);
      if(min > 0){
        setMin(min => min - 30);
        setMax(max => max - 30);
      } 
      else{
        setMin(0);
        setMax(30);
      }
    }
    const goForward = () => {
      console.log("Min: " + min + " Max: " + max);
      if(min < filteredImageData!.length && max < filteredImageData!.length - 1){
        setMin(min => min + 30);
        setMax(max => max + 30);
      } 
      else{
        setMax(filteredImageData!.length - 1);
        setMin(filteredImageData!.length - 30);
      }
    }

    

     const [timeSpan, setTimeSpan] = useState('All');
     const [maxWeight, setMaxWeight] = useState(0);
     const [minWeight, setMinWeight] = useState(0);
     const [allWeights, setAllWeights]: any = useState([]);
     const [filteredWeights, setFilteredWeights]: any = useState([]);

    useEffect(() => {
      console.log("All weights: " + allWeights.length); 
        const weights = route.params.imageData?.map(item => item.weight) 
        setAllWeights(weights);
        setFilteredWeights(weights);
    }, [])

    const checkValidRange = (startMonth: number, startYear: number, endMonth: number, endYear: number): imageDataType[] => {
        const newData = route.params.imageData!.filter((item: imageDataType) => {
                    const itemMonth = item.date.substring(0,2).trim()[0] === '0' ? parseInt(item.date.substring(0,2).trim()[1]) : parseInt(item.date.substring(0,2).trim());
                    const itemYear = item.date.substring(6,8).trim()[0] === '0' ? parseInt(item.date.substring(6,8).trim()[1]) : parseInt(item.date.substring(6,8).trim());
        
                    return ((startYear < itemYear && itemYear < endYear && startMonth >= 1 && startMonth <= 12 && 
                            endMonth >= 1 && endMonth <= 12) ||
                            (startYear == itemYear && startMonth <= itemMonth && itemYear < endYear && startMonth >= 1 && startMonth <= 12 && 
                            endMonth >= 1 && endMonth <= 12) ||
                            (startYear < itemYear && itemMonth <= endMonth && itemYear == endYear && startMonth >= 1 && startMonth <= 12 && 
                            endMonth >= 1 && endMonth <= 12) ||
                            (startYear == itemYear && startMonth <= itemMonth && itemMonth <= endMonth && itemYear == endYear && startMonth >= 1 && startMonth <= 12 && 
                            endMonth >= 1 && endMonth <= 12))
                    }          
                )
            
            return newData
    }

    useEffect(() => {
       if(allWeights.length > 0){
        const formattedDate = format(new Date(), 'MM/dd/yy'); 
        let currentMonth = formattedDate.substring(0, 2).trim();
        let currentYear = formattedDate.substring(6, 8).trim();
        const currentNumMonth = currentMonth[0] === '0' ? parseInt(currentMonth[1]) : parseInt(currentMonth);
        const currentNumYear = currentYear[0] === '0' ? parseInt(currentYear[1] ): parseInt(currentYear);
        if(timeSpan == '7D'){
            setFilteredWeights(allWeights.slice(-7));
          }
          if(timeSpan == '1M'){
            const newData = checkValidRange(currentNumMonth, currentNumYear, currentNumMonth, currentNumYear);
            setFilteredWeights(newData.map(item => item.weight));
          }
          if(timeSpan == '6M'){
            const startMonth = currentNumMonth - 6 <= 0 ? 12 - currentNumMonth : currentNumMonth - 6;
            const startYear = currentNumMonth - 6 <= 0 ? currentNumYear - 1 : currentNumYear;
            const newData = checkValidRange(startMonth, startYear, currentNumMonth, currentNumYear);
            setFilteredWeights(newData.map(item => item.weight));
          }
          if(timeSpan == '1Y'){
      
            const startYear = currentNumYear - 1;
            const newData = checkValidRange(currentNumMonth, startYear, currentNumMonth, currentNumYear);
            setFilteredWeights(newData.map(item => item.weight));
          }
          if(timeSpan == 'All'){
            setFilteredWeights(allWeights);
          }
      }
    }, [timeSpan])
     
     useEffect(() => { 
      if(filteredWeights != null && filteredWeights.length > 0){
            // filteredImageData.map(item => console.log("Item: " + item.weight));
            setMaxWeight(Math.max(...filteredWeights))
            setMinWeight(Math.min(...filteredWeights))
            console.log(filteredWeights.length);
      }
     }, [filteredWeights])


     const [showValues, setShowValues] = useState(false);

     const handleShowValues = (scaleX: number, scaleY: number) => {
        console.log("handleShowValues entered");
      const zoomAmount = 1.5;

        if(scaleX >= zoomAmount && !showValues){
          setShowValues(true);
        }
        else{
          setShowValues(false);
        }
     }
        
     
     if(!dataLoaded){
      return(<View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black'}}>
              <ActivityIndicator size="large" color="#00ffff" />
            </View> ) 
     }
    
    return(

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.pageContainer}>
           {!validSearch ? <View style={{position: 'absolute', top: '50%', alignSelf: 'center'}}>
                   <Text style={styles.text}>- No results found -</Text>
                 </View> : null}
            <View style={styles.returnButtonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Data', {imageData: imageData!})}>
                    <Text style={styles.arrowButton}>←</Text>
                </TouchableOpacity>
             </View>
            
          {!rangeSelected ? <TouchableOpacity style={ search ? styles.exitButton1 : styles.exitButton2} onPress={() => {
            exitSearch()
            setSearch(false);
          }}> 
             <Text style={styles.text}>X</Text>
                  </TouchableOpacity>
          :  <TouchableOpacity style={ search ? styles.exitButton3 : styles.exitButton4} onPress={() => {
            exitSearch()
            setSearch(false);
          }}>
             <Text style={styles.text}>X</Text>
                  </TouchableOpacity>
            }
                     
          { (imageData != null && imageData!.length > 0) ?
            <TouchableOpacity style={rangeSelected ? styles.rangeButton2 : styles.rangeButton1}
                                        onPress={() => {
                                        setRangeSelected(select => !select)
                                        setMonth('');
                                        setYear('');
                                        setMonth1('');
                                        setYear1('');
                                        setMonth2('')
                                        setYear2('');
                                            setTimeout(() => {
                                              monthRef.current?.focus();
                                            }, 150)
                                           setSearch(true);
                                          }
                                        }> 
                                      <Image source={require('./range.png')} style={{width: !isTablet() ? 35 : 55, height: !isTablet() ? 30 : 50}} />
                                      </TouchableOpacity>
         : null
          }

          {(imageData != null && imageData!.length > 0 && !rangeSelected) ?
           <View style={styles.searchContainer}>
            <Image source={require('./mgi.png')} style={styles.mgiStyle}/>
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
                            onPressIn={() => setSearch(true)}
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
                        onPressIn={() => setSearch(true)}
                          />
                                   
                        </View>
            </View>
            : 
            null
        }
         {(imageData != null && imageData!.length > 0 && rangeSelected) ?
            <View style={styles.searchContainer2}>
                   <Image source={require('./mgi.png')} style={styles.mgiStyle}/>
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
            : 
            null
        }
        {(imageData != null && imageData!.length > 0 && validSearch) ?
        <View style={styles.mainContainer}>
           
            

   
   <LineChart
    ref={chartRef}
    chartGestureListener={{
      
     onChartGestureStart: () => console.log('Gesture started ✅'),
    onChartScale: (event:any) => {
      const { scaleX, scaleY } = event.nativeEvent;
      handleShowValues(scaleX, scaleY);
    },
  }}

  style={styles.lineChart}
  data={{
    dataSets: [
      {
        values: filteredImageData!.map((item, index) => ({x: index, y: Number(item.weight) })),
        config: {
          color: processColor('#00ffff'),
          drawCircles: true,
          circleColors: filteredImageData!.map((item) => 
          {
            // console.log("Item weight: " + item.weight)
             return processColor(item.weight == goalWeight ? 'gold' : '#00ffff')
          }
          
        ),
          circleRadius: !isTablet() ? 3 : 5,  
          lineWidth: 1,
          drawValues: true,
          valueTextColor: processColor('#00ffff'),
          valueTextSize: !isTablet() ? 10 : 15
        },
      },

      
    ],
  }}
  xAxis={{
    // Gets the indexes for all of the values in the chart so it's all x values for the y ones.
    valueFormatter: filteredImageData!.map((item) => item.date),
    valueFormatterType: 'value',
    position: 'BOTTOM',
    textColor: processColor('white'),
    textSize: !isTablet() ? 10 : 15,
    axisLineColor: processColor('white'),
    drawGridLines: false,
    // Spacing labels by a fixed interval of 1.
    granularityEnabled: true,
    granularity: 1,
    avoidFirstLastClipping: true, 
    labelCount: 3,
    axisMinimum: Math.max(0, min),
    axisMaximum: Math.min(filteredImageData!.length - 1, max)
  }}
  yAxis={{
    left: {
      axisMinimum: 0,
      axisMaximum: 600,
      textColor: processColor('white'),
      textSize: !isTablet() ? 10 : 15,
      axisLineColor: processColor('white'),
      drawGridLines: true,
      limitLines:[{ 
      limit: Number(goalWeight!), 
      labelPosition: 'LEFT_TOP',
      lineColor: processColor('#00ffff'),
      lineWidth: 1,
    }]
    },
    right: { enabled: false },
  }}
  visibleRange={{
    x: { min: 1, max: 30 }, 
  }}
  legend={{enabled: false}}
  dragEnabled={true}
  scaleEnabled
  pinchZoom
  doubleTapToZoomEnabled
  touchEnabled 
/> 
{/* </View> */}
{/* </ScrollView> */}
    <View style={styles.arrowContainer}>
      <TouchableOpacity style={styles.chartButtons} onPress={() => {
        if(min > 0){
          goBack();
        }
      }}>
        <Text style={(min > 0) ? styles.arrowButton : {opacity: 0}}>←</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.chartButtons} onPress={goForward}>
        <Text style={(max < filteredImageData!.length - 1) ? styles.arrowButton : {opacity: 0}}>→</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.timeSpanContainer}>
        <TouchableOpacity style={timeSpan == '7D' ? styles.timeSpanLeftEndSelected : styles.timeSpanLeftEnd} onPress={() => setTimeSpan('7D')}>
          <Text style={styles.smallerText}>7D</Text>
        </TouchableOpacity>
        <TouchableOpacity style={timeSpan == '1M' ? styles.timeSpanSelected : styles.timeSpan} onPress={() => setTimeSpan('1M')}>
          <Text style={styles.smallerText}>1M</Text>
        </TouchableOpacity>
        <TouchableOpacity style={timeSpan == '6M' ? styles.timeSpanSelected : styles.timeSpan} onPress={() => setTimeSpan('6M')}>
          <Text style={styles.smallerText}>6M</Text>
        </TouchableOpacity>
        <TouchableOpacity style={timeSpan == '1Y' ? styles.timeSpanSelected : styles.timeSpan} onPress={() => setTimeSpan('1Y')}>
          <Text style={styles.smallerText}>1Y</Text>
        </TouchableOpacity>
        <TouchableOpacity style={timeSpan == 'All' ? styles.timeSpanRightEndSelected : styles.timeSpanRightEnd} onPress={() => setTimeSpan('All')}>
          <Text style={styles.smallerText}>All</Text>
        </TouchableOpacity>
      </View>
      <View style={{flexDirection: 'column', alignItems: 'center', width: 200, marginTop: 10}}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.smallerText}>Low: </Text>
          <Text style={styles.smallerText}>{minWeight}</Text>
          <Text style={styles.smallerText}>{unit}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.smallerText}>High: </Text>
          <Text style={styles.smallerText}>{maxWeight}</Text>
          <Text style={styles.smallerText}>{unit}</Text>
          </View>
          <Text style={styles.goalText}>Goal: {goalWeight}{unit}</Text>
        </View>
    
        </View> : 
          <View>
           {!search && <View style={{position: 'absolute', top: '50%', alignSelf: 'center'}}>
            <Text style={styles.text}>No Data to Display</Text>
            </View>}
            </View>
        }
        </View>
        </TouchableWithoutFeedback>
    )
  }