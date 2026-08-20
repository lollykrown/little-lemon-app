
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'


export type Profile = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  profileImage: string | null;
  orderStatus: boolean;
  pwdChanges: boolean;
  special: boolean;
  newsletters: boolean;
};
export type Item = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
};
export const PROFILE_KEY = "userProfile";

export const DEFAULT_PROFILE: Profile = {
  firstname: "Tilly",
  lastname: "Smith",
  email: "smith@example.com",
  phone: "123-456-7890",
  profileImage: null,
  orderStatus: false,
  pwdChanges: false,
  special: false,
  newsletters: false,
};


    /**
   * Save a temporary image URI permanently
   */
export const saveImageToDisk = async (uri: string) => {
    try {
    const filename = `profile-${Date.now()}.jpg`;

    const destination =
        FileSystem.documentDirectory + filename;

    await FileSystem.copyAsync({
        from: uri,
        to: destination,
    });

    return destination;
    } catch (error) {
    console.log("Failed to save image:", error);
    return null;
    }
};

    /* Delete an image from the device */
export const deleteImageFromDisk = async (uri: string | null) => {
    if (!uri) {
    return;
    }

    try {
    // Only delete files belonging to our app's document directory
    if (
        FileSystem.documentDirectory &&
        uri.startsWith(FileSystem.documentDirectory)
    ) {
        await FileSystem.deleteAsync(uri, {
        idempotent: true,
        });
    }
    } catch (error) {
    console.log("Failed to delete image:", error);
    }
};

export  const saveProfile = async (profileObj: Profile, image: string | null) => {
    try {
      const profile: Profile = {...profileObj, profileImage: image,};

      await AsyncStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
      );
      await AsyncStorage.setItem("onboardingComplete","true")

      Alert.alert(
        "Profile Saved",
        "Your profile has been updated successfully."
      );

    //   console.log("Profile saved:", profile);
    } catch (error) {
      console.log("Failed to save profile:", error);

      Alert.alert(
        "Error",
        "Unable to save your profile."
      );
    }
  };

export const loadProfile = async (
  setProfileObj: React.Dispatch<React.SetStateAction<Profile>>,
  setImage: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);

    if (!storedProfile) {
      setProfileObj(DEFAULT_PROFILE);
      setImage(DEFAULT_PROFILE.profileImage ?? null);
      return;
    }

    const parsedProfile = JSON.parse(storedProfile);

    const profile: Profile = {
      ...DEFAULT_PROFILE,
      ...parsedProfile,
    };

    setProfileObj(profile);
    setImage(profile.profileImage ?? null);
  } catch (error) {
    console.error('Failed to load profile:', error);

    // Optional fallback
    setProfileObj(DEFAULT_PROFILE);
    setImage(DEFAULT_PROFILE.profileImage ?? null);
  }
};
export const getImage = async () => {
  try {
    const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);

    if (!storedProfile) {;
      return null;
    }

    const parsedProfile = JSON.parse(storedProfile);


    return parsedProfile.profileImage;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return null
  }
};
