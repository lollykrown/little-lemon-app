import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'expo-checkbox';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  deleteImageFromDisk,
  saveImageToDisk,
  saveProfile,
  loadProfile,
  DEFAULT_PROFILE
} from '../../lib/utils';


export default function ProfilePage() {
  const [profileObj, setProfileObj] = useState(DEFAULT_PROFILE);

  const [image, setImage] = useState<string | null>(
    DEFAULT_PROFILE.profileImage,
  );

  // /* Load saved profile when screen opens*/
  useEffect(() => {
    loadProfile(setProfileObj,setImage);
  }, []);


  /**
   * Pick image from camera roll
   */
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access the media library is required.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    // console.log(result);
    if (result.canceled) {
      return;
    }

    const selectedUri = result.assets[0].uri;

    const savedUri = await saveImageToDisk(selectedUri);

    if (!savedUri) {
      Alert.alert('Error', 'Unable to save the selected image.');
      return;
    }

    // Delete previous locally stored image
    if (image && image !== savedUri) {
      await deleteImageFromDisk(image);
    }
    setImage(savedUri);
  };

  /**
   * Take a photo
   */
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission required',
        'Permission to access the camera is required.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    // console.log(result);

    if (result.canceled) {
      return;
    }

    const selectedUri = result.assets[0].uri;

    const savedUri = await saveImageToDisk(selectedUri);

    if (!savedUri) {
      Alert.alert('Error', 'Unable to save the photo.');
      return;
    }

    // Delete previous locally stored image
    if (image && image !== savedUri) {
      await deleteImageFromDisk(image);
    }

    setImage(savedUri);
  };

  const confirmRemove = () => {
    if (!image) return;
    Alert.alert(
      'Remove Picture',
      'Are you sure you want to delete your Avatar?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteImageFromDisk(image);
            setImage(null);
          },
        },
      ],
    );
  };

  const showOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Would you like to take a picture or use an existing picture?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Camera Roll',
          onPress: () => pickImage(),
        },
        {
          text: 'Take a Photo',
          onPress: () => takePhoto(),
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  /**
   * Save entire profile
   */

  const deleteProfile = async () => {
    try {
      // Get the saved profile first
      const storedProfile = await AsyncStorage.getItem('userProfile');

      if (storedProfile) {
        const profile = JSON.parse(storedProfile);

        // Delete the profile image from the device
        if (profile.profileImage) {
          await deleteImageFromDisk(profile.profileImage);
        }
      }

      // Delete the profile object
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('onboardingComplete');

      // Reset the form
      setProfileObj(DEFAULT_PROFILE);
      setImage(null);

      Alert.alert(
        'Profile Deleted',
        'Your profile has been deleted successfully.',
      );

      router.replace('/');
    } catch (error) {
      console.log('Failed to delete profile:', error);

      Alert.alert('Error', 'Unable to delete your profile.');
    }
  };

  /**
   * Discard changes and restore saved profile
   */
  const discardChanges = async () => {
    await loadProfile(setProfileObj,setImage);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.sectionLabel}>Avatar</Text>
        <View>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.initialsContainer}>
                  <Text style={styles.initials}>
                    {profileObj?.firstname?.[0] ?? ''}{' '}
                    {profileObj.lastname?.[0] ?? ''}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={showOptions}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!image}
              onPress={confirmRemove}
              style={[styles.outlineButton, !image && styles.disabledButton]}
            >
              <Text style={styles.outlineButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              placeholder="First Name"
              accessibilityLabel="First name"
              style={styles.input}
              value={profileObj.firstname}
              autoCapitalize="words"
              onChangeText={(e) =>
                setProfileObj((prev) => ({ ...prev, firstname: e }))
              }
              keyboardType="email-address"
              clearButtonMode="while-editing"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              placeholder="Last Name"
              accessibilityLabel="Last name"
              style={styles.input}
              value={profileObj.lastname}
              autoCapitalize="words"
              onChangeText={(e) =>
                setProfileObj((prev) => ({ ...prev, lastname: e }))
              }
              keyboardType="email-address"
              clearButtonMode="while-editing"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              placeholder="Email"
              accessibilityLabel="Email"
              style={styles.input}
              value={profileObj.email}
              onChangeText={(e) =>
                setProfileObj((prev) => ({ ...prev, email: e }))
              }
              keyboardType="email-address"
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              placeholder="Phone Number"
              accessibilityLabel="Phone number"
              style={styles.input}
              value={profileObj.phone}
              onChangeText={(e) =>
                setProfileObj((prev) => ({ ...prev, phone: e }))
              }
              keyboardType="phone-pad"
              clearButtonMode="while-editing"
            />
          </View>
        </View>
        <Text style={styles.title}>Email Notifications</Text>
        <View>
          <View style={styles.checkboxCont}>
            <Checkbox
              value={profileObj.orderStatus}
              onValueChange={(e) =>
                setProfileObj((prev) => ({ ...prev, orderStatus: e }))
              }
              color={profileObj?.orderStatus ? '#495E57' : undefined}
            />

            <Text style={styles.checkboxText}>Order Statuses</Text>
          </View>
          <View style={styles.checkboxCont}>
            <Checkbox
              value={profileObj.pwdChanges}
              onValueChange={(e) =>
                setProfileObj((prev) => ({ ...prev, pwdChanges: e }))
              }
              color={profileObj?.pwdChanges ? '#495E57' : undefined}
            />

            <Text style={styles.checkboxText}>Password Changes</Text>
          </View>
          <View style={styles.checkboxCont}>
            <Checkbox
              value={profileObj.special}
              onValueChange={(e) =>
                setProfileObj((prev) => ({ ...prev, special: e }))
              }
              color={profileObj?.special ? '#495E57' : undefined}
            />

            <Text style={styles.checkboxText}>Special Offers</Text>
          </View>
          <View style={styles.checkboxCont}>
            <Checkbox
              value={profileObj.newsletters}
              onValueChange={(e) =>
                setProfileObj((prev) => ({ ...prev, newsletters: e }))
              }
              color={profileObj?.newsletters ? '#495E57' : undefined}
            />
            <Text style={styles.checkboxText}>Newsletters</Text>
          </View>
          <TouchableOpacity
            onPress={deleteProfile}
            style={{
              marginVertical: 20,
              backgroundColor: '#F4CE14',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={discardChanges}
              style={styles.discardButton}
            >
              <Text style={{ color: '#868686', fontWeight: 'bold' }}>
                Discard Changes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => saveProfile(profileObj, image)}
              style={styles.saveButton}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    margin: 10,
    fontFamily: 'Karla',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionLabel: {
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 80,
    height: 80,
  },
  initialsContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#495E57',
  },
  initials: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  primaryButton: {
    marginLeft: 20,
    backgroundColor: '#495E57',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  outlineButton: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#495E57',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  outlineButtonText: {
    color: '#868686',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    color: '#656565',
    fontWeight: 400,
  },
  checkboxCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkboxText: {
    marginLeft: 8,
    fontWeight: 600,
    color: '#656565',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 80,
  },

  discardButton: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#495E57',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  saveButton: {
    marginLeft: 20,
    backgroundColor: '#495E57',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});
