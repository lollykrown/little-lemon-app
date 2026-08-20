import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { FlatList, TextInput, ListRenderItem, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { getCategories,filterMenu, getMenu, getMenuByCategories, saveMenu } from '../../lib/database';
import type { Item } from '../../lib/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

const capitalizeWords = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

export default function Home() {
  const [menu, setMenu] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setActiveCategories((prev) => {
      if (prev.includes(category)) {
        // Remove category if already selected
        return prev.filter((item) => item !== category);
      }

      // Add category if not selected
      return [...prev, category];
    });
  };

  const loadMenu = async () => {
    try {
      // 1. Check SQLite first
        const token = await AsyncStorage.getItem("onboardingComplete");

        if (!token) {
          return;
        }

      const storedMenu = await getMenu();

      if (storedMenu.length > 0) {
        console.log('Loading menu from SQLite');

        setMenu(storedMenu);
        const storedCategories = await getCategories();
        setCategories([...storedCategories,'drinks']);
        setMenuLoaded(true);
        return;
      }

      // 2. SQLite is empty, so fetch from server
      console.log('SQLite empty. Fetching menu from API...');

      const res = await fetch(
        'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json',
      );

      if (!res.ok) {
        throw new Error('Failed to fetch menu');
      }

      const result = await res.json();

      // 3. Save API response into SQLite
      await saveMenu(result.menu);

      // 4. Display the menu
      setMenu(result.menu);
      const storedCategories = await getCategories();
        console.log('h',storedCategories)

      setCategories(storedCategories);
      setMenuLoaded(true);

    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  };

  useEffect(() => {
    if (!menuLoaded) return;
    const timeout = setTimeout(() => {
      filterMenuFromDatabase();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, activeCategories,menuLoaded]);

  useEffect(() => {
    loadMenu();
    setMenuLoaded(true);
  }, []);

  useEffect(() => {
  const filterMenu = async () => {
    try {
      const filtered =
        await getMenuByCategories(
          activeCategories
        );

      setMenu(filtered);
    } catch (error) {
      console.error(
        "Failed to filter menu:",
        error
      );
    }
  };

  filterMenu();
}, [activeCategories]);

  const filterMenuFromDatabase = async () => {
    try {
      const results = await filterMenu(
        activeCategories,
        search
      );

      setMenu(results);
    } catch (error) {
      console.error(
        "Failed to filter menu:",
        error
      );
    }
  };

  const renderItem: ListRenderItem<Item> = ({ item }) => (
    <View
      style={{
        padding: 12,
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
      }}
    >
      <View style={{ gap: 10, flex: 0.7 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
        <Text style={{ color: '#495E57' }}>{item.description}</Text>
        <Text style={{ fontWeight: 'bold' }}>${item.price}</Text>
      </View>
      <Image
        source={{
          uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.image}?raw=true`,
        }}
        style={{
          flex: 0.3,
          height: 90,
          width: '100%',
          borderRadius: 18,
          marginLeft: 8,
        }}
      />
    </View>
  );

  return (
    <FlatList
      data={menu}
      renderItem={renderItem}
      keyExtractor={(item) => item.name}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: 1,
            backgroundColor: '#ddd',
          }}
        />
      )}
      ListEmptyComponent={
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 50,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#495E57",
          }}
        >
          No menu items found
        </Text>

        <Text
          style={{
            marginTop: 8,
            color: "#777",
            textAlign: "center",
          }}
        >
          There are no items available in this category.
        </Text>
      </View>}
      ListHeaderComponent={
        <>
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
                }}
              />
            </View>
            <View
              style={{
                marginTop: 15,
                backgroundColor: '#fff',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                height: 45,
                borderWidth: 1,
                borderColor: '#ddd',
              }}
            >
              <Ionicons
                name="search"
                size={22}
                color="#495E57"
              />

              <TextInput
                placeholder="Search menu"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  fontSize: 16,
                  color: '#333',
                }}
              />
            </View>
          </View>

          <View style={{ padding: 10 }}>
            <Text style={styles.sectionTitle}>ORDER FOR DELIVERY!</Text>

            <View
              style={{
                paddingBottom: 20,
                paddingTop: 10,
                gap: 18,
                justifyContent: 'space-between',
                borderColor: '#ccc',
                flexDirection: 'row',
                borderBottomWidth: 1,
              }}
            >
            {categories.map((category) => {
                const selected =
                  activeCategories.includes(category);

                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => toggleCategory(category)}
                    style={{
                      backgroundColor: selected
                        ? "#495E57"
                        : "#d7d7d7",
                      padding: 8,
                      borderRadius: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: selected
                          ? "white"
                          : "#495E57",
                        fontSize: 14,
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    >
                      {capitalizeWords(category)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>
      }
    />
  );
}

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
    fontSize: 18,
    color: 'white',
    flex: 1.2,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
});
