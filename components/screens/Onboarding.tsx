import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { saveProfile } from '../../lib/utils';

type Profile = {
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
const DEFAULT_PROFILE: Profile = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  profileImage: null,
  orderStatus: false,
  pwdChanges: false,
  special: false,
  newsletters: false,
};

const Onboarding = () => {
  const [obj, setObj] = useState(DEFAULT_PROFILE);

  const isEmailValid = (email: string) => {
    const e = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  };

  const isFormValid = () => {
    return (
      obj?.firstname.trim() !== '' &&
      obj?.lastname.trim() !== '' &&
      obj?.phone.trim() !== '' &&
      isEmailValid(obj?.email)
    );
  };

  const handleNextPress = () => {
    // Handle form submission or navigation here
    saveProfile(obj, null);
    router.replace('/profile');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.heroBg}>
          <Text style={styles.littleLemon}>Little Lemon</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <View style={{ flex: 0.8 }}>
              <Text style={styles.chicago}>Chicago</Text>
              <Text style={styles.description}>
                We are a family owned Mediterranean restaurant, focused on
                traditional recipes served with a modern twist.
              </Text>
            </View>
            <Image
              source={require('../../assets/images/hero.png')}
              style={{
                flex: 0.8,
                height: 180,
                width: '100%',
                borderRadius: 18,
                marginLeft: 8,
                // contentFit: 'cover',
              }}
            />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Let&apos;s get to know you</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>First Name * </Text>
          <TextInput
            placeholder="Enter your first name"
            accessibilityLabel="First Name"
            style={styles.input}
            value={obj?.firstname}
            onChangeText={(e) => setObj((prev) => ({ ...prev, firstname: e }))}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Last Name * </Text>
          <TextInput
            placeholder="Enter your last name"
            accessibilityLabel="Last Name"
            style={styles.input}
            value={obj?.lastname}
            onChangeText={(e) => setObj((prev) => ({ ...prev, lastname: e }))}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            placeholder="Enter your Email"
            accessibilityLabel="Email address"
            style={styles.input}
            value={obj?.email}
            onChangeText={(e) => setObj((prev) => ({ ...prev, email: e }))}
            keyboardType="email-address"
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number *</Text>
          <TextInput
            placeholder="Enter your phone number"
            accessibilityLabel="Phone Number"
            style={styles.input}
            value={obj?.phone}
            onChangeText={(e) => setObj((prev) => ({ ...prev, phone: e }))}
            keyboardType="phone-pad"
            clearButtonMode="while-editing"
          />
        </View>

        <TouchableOpacity
          disabled={!isFormValid()}
          style={[styles.button, !isFormValid() && styles.buttonEnabled]}
          onPress={handleNextPress}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  heroBg: {
    backgroundColor: '#495E57',
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  littleLemon: {
    fontSize: 48,
    color: '#F4CE14',
    fontFamily: 'MarkaziText',
    margin: 0,
  },
  chicago: {
    fontFamily: 'MarkaziText',
    fontSize: 36,
    color: 'white',
    marginTop: -18,
    // fontWeight:600
  },
  description: {
    fontFamily: 'Karla',
    fontSize: 16,
    color: 'white',
    flex: 1.2,
    marginTop: 8,
  },
  inputContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputLabel: {
    marginBottom: 6,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#495E57',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    marginLeft: 'auto',
    marginRight: 20,
    marginTop: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  buttonEnabled: {
    backgroundColor: '#a1a1a1',
  },
});
