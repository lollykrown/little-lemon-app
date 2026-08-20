import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../components/SplashScreen';
import Onboarding from '../components/screens/Onboarding';
import Home from '../components/screens/Home';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getData = async () => {
    try {
      setIsLoading(true)
      const value = await AsyncStorage.getItem('onboardingComplete');

      // console.log('onboardingComplete:', value, isLoggedIn);

      if (value !== null) {
        setIsLoading(false)
        setIsLoggedIn(true);
      }
    } catch (e) {
      // error reading value
      console.log('Error reading from AsyncStorage:', e);
      setIsLoggedIn(false);
      setIsLoading(false)

    }
  };

  useEffect(() => {
    // removeValue()
    getData();
  }, []);


// Still checking authentication
  if (isLoading === null) {
    return <SplashScreen />;
  }

  // Logged in
  if (isLoggedIn) {
    return <Home />;
  }

  // Not logged in
  return <Onboarding />;
}
