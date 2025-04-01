import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Platform, SafeAreaView } from 'react-native';
import { Post } from '../components/Post';

const SAMPLE_POSTS = [
  {
    id: '1',
    profilePic: 'https://cdn.bsky.app/img/avatar/plain/did:plc:qejaj4rg4bq2bpvknj63f36m/bafkreidwoxgqiawiahnjnha6mnmlfwlxfv7frgvrc3i2gmbwaphorapsha@jpeg',
    name: 'Violin',
    timeAgo: '6h ago',
    content: "New Mario Party DS Story Mode PB! Huge improvement over my first run, and this puts me from 50th to 25th place on the leaderboard! I'm not sure how much more I will run this, but top 10 could be a cool goal mayhaps",
    media: 'https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:qejaj4rg4bq2bpvknj63f36m/bafkreialde62gowmomvvodmktbryqvmfsminse7r3maqo76hzlr5egrov4@jpeg',
  },
  {
    id: '2',
    profilePic: 'https://via.placeholder.com/100',
    name: 'Jane Smith',
    timeAgo: '8h ago',
    content: 'Second post content',
  }
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;
const isLargeScreen = SCREEN_WIDTH > 428;

export const Timeline: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.dotsContainer}>
          {SAMPLE_POSTS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentPage === i && styles.activeDot
              ]}
            />
          ))}
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {SAMPLE_POSTS.map((post) => (
            <View key={post.id} style={styles.pageContainer}>
              <Post {...post} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 8 : isLargeScreen ? 16 : 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Platform.select({
      ios: 16,
      android: 12,
    }),
    marginTop: Platform.select({
      ios: 0,
      android: 8,
    }),
  },
  dot: {
    width: isSmallScreen ? 4 : 6,
    height: isSmallScreen ? 4 : 6,
    borderRadius: isSmallScreen ? 2 : 3,
    backgroundColor: '#333',
    marginHorizontal: isSmallScreen ? 2 : 3,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: isSmallScreen ? 6 : 8,
    height: isSmallScreen ? 6 : 8,
    borderRadius: isSmallScreen ? 3 : 4,
  },
});
