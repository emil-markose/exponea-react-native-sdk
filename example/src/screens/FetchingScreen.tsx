import React from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import ExponeaButton from '../components/ExponeaButton';
import Exponea from 'react-native-exponea-sdk';
import FetchRecommendationsModal from '../components/FetchRecommendationsModal';
import {Segment} from '../../../src/ExponeaType';

export default function FetchingScreen(): React.ReactElement {
  const [showingFetchRecommendations, setShowingFetchRecommendations] =
    React.useState(false);

  const fetchConsents = async () => {
    try {
      const consents = await Exponea.fetchConsents();
      Alert.alert('Received consents', JSON.stringify(consents, null, 2));
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error fetching consents', errorMessage);
    }
  };
  const fetchRecommendations = () => {
    setShowingFetchRecommendations(true);
  };
  const fetchSegments = async () => {
    try {
      const segments: Array<Segment> = await Exponea.getSegments(
        'discovery',
        true,
      );
      Alert.alert('Received segments', JSON.stringify(segments, null, 2));
    } catch (error) {
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error fetching segments', errorMessage);
    }
  };
  return (
    <View style={styles.container}>
      <FetchRecommendationsModal
        visible={showingFetchRecommendations}
        onClose={() => {
          setShowingFetchRecommendations(false);
        }}
      />
      <ExponeaButton title="Fetch Consents" onPress={fetchConsents} />
      <ExponeaButton
        title="Fetch Recommendations"
        onPress={fetchRecommendations}
      />
      <ExponeaButton title="Fetch Segments" onPress={fetchSegments} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
