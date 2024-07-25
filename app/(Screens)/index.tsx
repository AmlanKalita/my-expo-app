import { Text, View, Image, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "./theme";
import { CalendarDaysIcon, MagnifyingGlassIcon} from 'react-native-heroicons/outline';
import {MapPinIcon} from 'react-native-heroicons/solid'
import { useCallback, useEffect, useState } from "react";
import {debounce, set} from 'lodash';
import { getLocationDetails, getWeatherForecast } from "@/api/weather";
import { WeatherData } from "./types"
import { weatherImages } from "@/constants";
import * as Progress from 'react-native-progress';
import { storeData, getData} from "@/utils/asyncStorage";
export type LocationProps = {
  country: string;
  id: number;
  lat: number;
  lon: number;
  name: string;
  region: string;
  url: string;
};



export default function HomeScreen() {
  const [showSearch,toggleSearch] = useState(false);
  const [locations, setLocations] = useState<LocationProps[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const handleLocation = (location : string) =>{
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    getWeatherForecast({
      cityName : location,
      days: 7
    }).then((res)=>{
      setLoading(false);
      storeData('city',location);
      setWeatherData(res);
    })
  }
  const handleSearch = (value : string) => {
    if (value.length<3) {
      setLocations([]);
      return
    };
    getLocationDetails({cityName : value}).then((res)=>{
      setLocations(res);
    })
  }

  useEffect(()=>{
    getDefaultWeatherData();
  },[]);

  const getDefaultWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = myCity || 'Hyderabad';
    getWeatherForecast({
      cityName : cityName,
      days: 7
    }).then((res)=>{
      setWeatherData(res);
      setLoading(false);
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch,1200),[]);
  
  const current = weatherData?.current;
  const location = weatherData?.location;
  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image blurRadius={40} source={require('../../assets/images/peakpx.jpg')}
        className="absolute h-full w-full"
      />
      {
        loading ? (
          <View className="flex-1 justify-center items-center">
            <Progress.Circle size={30} indeterminate={true} color="white"/>
          </View>
        ):
        (
          <SafeAreaView className="flex flex-1">
            <View style={{height:"7%"}} className="mx-4 relative z-50">
              <View className="flex-row justify-end items-center rounded-full"
                style={{backgroundColor : showSearch ? theme.bgWhite(0.2) : "transparent"}}> 
                  {showSearch && (
                    <TextInput 
                      onChangeText={handleTextDebounce}
                      placeholder="Search City"
                      placeholderTextColor={'lightgrey'}
                      className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                  />
                  )}
                  <TouchableOpacity 
                    onPress={()=>toggleSearch(!showSearch)}
                    style={{backgroundColor:theme.bgWhite(0.3)}}
                    className="rounded-full p-3 m-1"
                  >
                    <MagnifyingGlassIcon size="25" color="white"/> 
                  </TouchableOpacity>
              </View>
              {locations.length>0 && showSearch ? (
                <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                  {
                    locations.map((location, index) => {
                      let showBorder = index+1!=locations.length;
                      const borderclass = showBorder ? "border-b-2 border-b-gray-400" : "";
                      return (
                        <TouchableOpacity
                          onPress={()=>handleLocation(location.name)} 
                          key={index} 
                          className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderclass}>
                          <MapPinIcon size="20" color="gray"/>
                          <Text className="text-black text-lg ml-2">{location?.name}, {location?.country}</Text>
                        </TouchableOpacity>
                    )
                  })
                  }
                </View>
              ) : null}
            </View>
            {/* forecast section */}
            <View className="mx-4 flex justify-around flex-1 mb-2">
              {/* location */}
              <Text className="text-white text-center text-2xl font-bold">
                {location?.name},
                <Text className="text-lg font-semibold text-gray-300">
                  {" "+location?.country}
                </Text>
              </Text>
              {/* Weather Image*/}
              <View className="flex-row justify-center">
                <Image
                  source={weatherImages[current?.condition?.text.toLowerCase() || 'other'] || weatherImages['other']}
                  className="w-52 h-52"
                />
              </View>
              {/* degree celcius */}
              <View className="space-y-2">
                <Text className="text-center font-bold text-white text-6xl ml-5">
                  {current?.temp_c}&#176;C
                </Text>
                <Text className="text-center text-xl text-white tracking-widest">
                  {current?.condition.text}
                </Text>
              </View>
              {/* other stats */}
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image source={require('../../assets/icons/wind.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">{current?.wind_kph} kmph</Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image source={require('../../assets/icons/drop.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image source={require('../../assets/icons/sun.png')}
                    className="h-6 w-6"
                  />
                  <Text className="text-white font-semibold text-base">{weatherData?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                </View>
              </View>
            </View>
            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white"/>
                <Text className="text-white text-base">Daily Forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{paddingHorizontal:15}}
                showsHorizontalScrollIndicator={false}
              >
              {
                  weatherData?.forecast?.forecastday.map((item,index)=>{
                    let date = new Date(item.date);
                    let conditionText = item?.day?.condition?.text?.toLowerCase();
                    let dayName = date.toLocaleDateString('en-US', { weekday: 'long' }); 
                    return ( 
                      <View 
                        key={index}
                        className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                        style={{ backgroundColor: theme.bgWhite(0.15)}}
                      >
                        <Image source={weatherImages?.[conditionText] || weatherImages['other']}
                          className="h-11 w-11"
                        />
                        <Text className="text-white text-base">{dayName}</Text>
                        <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                      </View>
                    )
                  })
                }
              </ScrollView>
            </View>
          </SafeAreaView>
        )
      }
      
    </View>
  );
}
