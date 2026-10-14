import AsyncStorage from '@react-native-async-storage/async-storage';

// Every test starts from a fresh install: no saved trip, prefs or cached feeds.
beforeEach(async () => {
  await AsyncStorage.clear();
});
