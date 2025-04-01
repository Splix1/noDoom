import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Platform } from 'react-native';

interface PostProps {
  profilePic: string;
  name: string;
  timeAgo: string;
  content?: string;
  media?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;
const isLargeScreen = SCREEN_WIDTH > 428;

export const Post: React.FC<PostProps> = ({
  profilePic,
  name,
  timeAgo,
  content,
  media,
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.header}>
        <Image
          source={{ uri: profilePic }}
          style={styles.profilePic}
        />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
      </View>
      
      {content && (
        <Text 
          style={styles.content}
          numberOfLines={isSmallScreen ? 3 : undefined}
        >
          {content}
        </Text>
      )}
      
      {media && (
        <Image
          source={{ uri: media }}
          style={styles.media}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: isSmallScreen ? 12 : isLargeScreen ? 20 : 16,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 8 : 12,
  },
  profilePic: {
    width: isSmallScreen ? 32 : 40,
    height: isSmallScreen ? 32 : 40,
    borderRadius: isSmallScreen ? 16 : 20,
    marginRight: isSmallScreen ? 8 : 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: Platform.select({
      ios: '600',
      android: '700',
    }),
  },
  timeAgo: {
    color: '#666',
    fontSize: isSmallScreen ? 12 : 14,
  },
  content: {
    color: '#fff',
    fontSize: isSmallScreen ? 14 : 16,
    marginBottom: isSmallScreen ? 8 : 12,
    lineHeight: Platform.select({
      ios: isSmallScreen ? 18 : 22,
      android: isSmallScreen ? 18 : 22,
    }),
  },
  media: {
    width: '100%',
    height: isSmallScreen ? 160 : isLargeScreen ? 240 : 200,
    borderRadius: 8,
  },
});
