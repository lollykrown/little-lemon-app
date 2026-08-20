import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import  { loadProfile, getImage } from '../lib/utils';
import { useEffect, useState } from 'react';

// yellow #F4CE14
// #495E57


const Logo = () => {
  return (
    <Image
      source={require('@/assets/images/logo.png')}
      contentFit="contain"
      style={{
        width: 300,
        height: 40,
        alignSelf: 'center',
      }}
    />
  );
};
export default function RootLayout() {

  const [image, setImage] = useState<string | null>(null);

  const loadImage = async() =>{
    const i = await getImage();
    console.log('image',i)
    if(i===null) return
    setImage(null)
  }

   useEffect(() => {
      loadImage()
    }, []);

  const [fontsLoaded] = useFonts({
    Karla: require('../assets/fonts/Karla-Regular.ttf'),
    'Karla-Medium': require('../assets/fonts/Karla-Medium.ttf'),
    'Karla-SemiBold': require('../assets/fonts/Karla-SemiBold.ttf'),
    'Karla-Bold': require('../assets/fonts/Karla-Bold.ttf'),
    'Karla-ExtraBold': require('../assets/fonts/Karla-ExtraBold.ttf'),
    'Karla-Light': require('../assets/fonts/Karla-Light.ttf'),
    'Karla-ExtraLight': require('../assets/fonts/Karla-ExtraLight.ttf'),

    MarkaziText: require('../assets/fonts/MarkaziText-Regular.ttf'),
    'MarkaziText-Medium': require('../assets/fonts/MarkaziText-Medium.ttf'),
    'MarkaziText-Bold': require('../assets/fonts/MarkaziText-Bold.ttf'),
    'MarkaziText-SemiBold': require('../assets/fonts/MarkaziText-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerTitle: () => <Logo />,
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{
          headerBackVisible: false
        }}
      />
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                router.navigate('/profile');
              }}
            >
            {image ? (
            <Image
              source={{ uri: image }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginLeft: 8,
              }}/>
              ) : (
              <Image
              source={require('../assets/images/profile.png')}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginLeft: 8,
              }}/>
              // <View style={styles.initialsContainer}>
              //   <Text style={styles.initials}>
              //     {profileObj?.firstname?.[0] ?? ''}{' '}
              //     {profileObj?.lastname?.[0] ?? ''}
              //   </Text>
              // </View>
            )}
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
            headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back();
              }}
            >
              <Ionicons
                style={{ color: '#485e58' }}
                name="arrow-back-circle"
                size={32}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
const styles = StyleSheet.create({
  initialsContainer: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#495E57',
  },
  initials: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})