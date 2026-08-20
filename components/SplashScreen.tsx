import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function SplashScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 40 }}>Loading...</Text>
    </View>
  )
}

const styles = StyleSheet.create({})