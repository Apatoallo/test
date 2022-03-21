/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect, useCallback} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Image,
  FlatList
} from 'react-native';
import {NetworkUtils} from './NetworkUtills';

import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from "@react-native-community/netinfo";

import AutocompleteInput from 'react-native-scrollable-autocomplete-input';

import Heart from './assets/icons8-heart-48-white.png';
import Hide from './assets/icons8-hide-48.png';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


const App: () => Node = () => {
 
  const [isState, setIsState] = useState([]);
  const [isLoading, setisLoading] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [whenRefresh, setWhenRefresh] = useState([]);
  const [searchVal, setsearchVal] = useState('');
  const [isOffline, setOfflineStatus] = useState(false);
  const [isSuggestion, setIsSuggestion] = useState([]);
  const [unwanted, setIsUnwanted] = useState([]);

  
  useEffect(() => {

    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setOfflineStatus(offline);
      console.log('internet reachable', state.isInternetReachable)
      console.log('is Connected', state.isConnected)
    });
    

    getFavorites()

    AsyncStorage.removeItem('FAVS')
    AsyncStorage.removeItem('UNWANTED')
    return () => removeNetInfoSubscription();
    
  }, [isSuggestion])

  

  const _searchTxt = useCallback((txt) => {

    fetch('http://www.omdbapi.com/?s='+txt+'&apikey=25995833')
    .then((res) => res.json())
    .then((json) => {

      console.log('is device ofline', isOffline)

      const searchList = json.Search
      // setSearchList(json.Search)

      console.log('Unwantedin search',unwanted)
      
      // console.log('SearchList',searchList);
      // isOffline && setOfflineStatus(false);

      // console.log('isOffline'isOffline)
      var filteredList = searchList.filter(function(objFromA) {
        return !unwanted.find(function(objFromB) {
          return objFromA.imdbID === objFromB.imdbID
        })
      })
      
      // console.log('ccc',filteredList)
     
      setIsSuggestion(filteredList); 
    })
    .catch((e) => {
      console.log(e);
    })

    setsearchVal(txt)

    
  },[isOffline]);
  
  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem('FAVS', JSON.stringify(favorites))
      alert('Movie/Show added to your favorites')
    } catch (e) {
      alert('Failed to save the data to the storage')
    }
  }

  const getFavorites = async () => {
    try {
      const favors = await AsyncStorage.getItem('FAVS')
      const favs = JSON.parse(favors)
      if (favors !== null) {
        setFavorites(favs)
        console.log(favs)
      }
      console.log('favsfavsfavs',favorites)
    } catch (e) {
      alert('Failed to fetch the data from storage')
    }
  }

  const saveUnwanted = async () => {
    try {
      await AsyncStorage.setItem('UNWANTED', JSON.stringify(unwanted))
      alert('Movie/Show will be hidden for your future searchs')
    } catch (e) {
      alert('Failed to save the data to the unwanted')
    }
  }

  const getUnwanted = async () => {
    try {
      const unwanted = await AsyncStorage.getItem('UNWANTED')
      const data = JSON.parse(unwanted)
      if (unwanted !== null) {
        setUnwanted(data)
        console.log(data)
      }
      
    } catch (e) {
      alert('Failed to fetch the data from storage')
    }
  }

  const _unwanted= (ID, title, poster, year) => {
    var obj = {
      imdbID: ID,
      Title: title,
      Poster: poster,
      Year: year
    }

    unwanted.push(obj)

    console.log(unwanted)

    saveUnwanted()
  }

  const _addToFavorites= (ID, title, poster, year) => {
    // alert(ID+ title+ poster+ year)
    
    var obj = {
      imdbID: ID,
      title: title,
      poster: poster,
      year: year
    }

    favorites.push(obj)

    console.log(favorites)
  
    saveFavorites()
  
  }
const renderItem = ({ item }) => {

  return(
    <View style={styles.listContainer}>
      <Image 
        style={styles.poster}
        source={{
          uri: item.poster,
        }}
        resizeMode={"cover"} 
        onLoadStart={() => setisLoading(true)}
        onLoadEnd={() => setisLoading(false)}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.year}>Release Date: {item.year}</Text>
        <View style={{flex: 1}}></View>
        <View style={styles.favContainer}>
          {/* <TouchableOpacity
            onPress={() => _addToFavorites(item.imdbID, item.Title, item.Poster, item.Year)}
          >
            <Image 
              style={styles.favoritesBtn} 
              source={Heart}
            />
          </TouchableOpacity> */}
          
        </View>
      </View>
    </View>

  )
}
  return (
    <SafeAreaView style={styles.container}>

      <View style={[styles.searchContainer,{zIndex: searchVal === '' ? 0:20}]}>
        <Text>{isOffline === false ? 'device connected to the internet': 'internet connection lost'}
        </Text>
            <AutocompleteInput
            keyboardShouldPersistTaps='always'
            autoCapitalize='none'
            autoCorrect={false}
            containerStyle={styles.containerStyle}
            inputContainerStyle={styles.inputContainerStyle}
            listStyle={styles.listStyles}
            placeholder='Looking for movies...'
            onChangeText={(txt) => _searchTxt(txt)}
            data={isSuggestion}
            flatListProps={{
              keyExtractor: (_, idx) => idx,
              renderItem: ({item}) => 
                
                  <View style={styles.listContainer}>
                      <Image 
                        style={styles.poster}
                        source={{
                          uri: item.Poster,
                        }}
                        resizeMode={"cover"} 
                        onLoadStart={() => setisLoading(true)}
                        onLoadEnd={() => setisLoading(false)}
                      />
                      <View style={styles.titleContainer}>
                        <Text style={styles.movieTitle}>{item.Title}</Text>
                        <Text style={styles.year}>Release Date: {item.Year}</Text>
                        <View style={{flex: 1}}></View>
                        <View style={styles.favContainer}>
                          <TouchableOpacity
                            onPress={() => _unwanted(item.imdbID, item.Title, item.Poster, item.Year)}
                          >
                            <Image 
                              style={styles.actionBtns} 
                              source={Hide}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => _addToFavorites(item.imdbID, item.Title, item.Poster, item.Year)}
                          >
                            <Image 
                              style={styles.actionBtns} 
                              source={Heart}
                            />
                          </TouchableOpacity>
                          
                        </View>
                      </View>
                  </View>

            }}
          />
        
      </View>
      
      <View style={styles.favors}>
        <View style={styles.listCover}>

          <Text style={styles.favTitle}>Favorites</Text>

          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item.imdbID}
            contentContainerStyle={{ paddingBottom: 30 }}
            // extraData={selectedId}
          />
        </View>
      </View>  

     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  
 container: {
  flex: 1,
  backgroundColor: '#E50914',
 },
 searchContainer: {
  flex: 1,
  padding: 10,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
 },
 containerStyle: {
  borderWidth: 0,
  marginBottom: 100,
 },
 listStyles: {
  backgroundColor: 'gray',
   
  //  borderTopLeftRadius: 100
 },
 inputContainerStyle: {
   borderRadius: 10,
   borderWidth: 0,
   marginVertical: 30,
   marginHorizontal: 45,
   marginBottom: 30,
   backgroundColor: '#E50914',

   
 },
 poster: {
   width: 150,
   height: 240,
   borderRadius: 10
 },

 listContainer: {
  
  flexDirection: 'row',
  marginLeft: 5,
  marginRight: 5,
  borderRadius: 10,
  height: 240,
  backgroundColor: '#000',
  marginBottom: 15,
  
 },

 movieTitle: {
   
   fontSize: 20,
   fontWeight: '800',
   textTransform: 'uppercase',
   color:'#fff',
   height: 'auto',
   width: '100%',


 },
 titleContainer: {
  justifyContent: 'space-between',
  flexDirection: 'column',  
  width: '60%',
  padding: 15,
 },
 year: {
  marginTop: 10,
  fontSize: 14,
  color: 'rgba(255,255,255,0.5)'
 },
 favors: {
  marginTop: 105,
  padding: 20,
  borderWidth: 0,
  borderColor: 'orange',
  position: 'absolute',
  backgroundColor: '#E50914',
  left: 0,
  right: 0,
  top: 0,
  bottom: 30,
  zIndex: 10
 },
 
 favTitle: {
   fontSize: 20,
   
   fontWeight: 'normal',
   marginLeft: 5,
   color: '#292929',
 },
 actionBtns: {
   width: 32,
   height: 32,
   marginRight: 10,
   
 },
 favContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'flex-end'
 },
 

});

export default App;
