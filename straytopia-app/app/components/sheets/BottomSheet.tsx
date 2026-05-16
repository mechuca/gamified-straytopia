import React, { useCallback } from 'react';
import { View, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { COLOR } from '@/app/lib/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}

export function BottomSheet({ visible, onClose, children, height = SCREEN_HEIGHT * 0.7 }: BottomSheetProps) {
  const translateY = useSharedValue(height);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onBegin(() => { context.value = { y: translateY.value }; })
    .onUpdate((event) => { translateY.value = Math.max(0, context.value.y + event.translationY); })
    .onEnd((event) => {
      if (event.translationY > 100) {
        translateY.value = withTiming(height, { duration: 300 });
      } else {
        translateY.value = withTiming(0, { duration: 300 });
      }
    });

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 380 });
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    translateY.value = withTiming(height, { duration: 380 });
    setTimeout(onClose, 380);
  }, [onClose, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <GestureDetector gesture={gesture}>
              <Animated.View style={[{
                backgroundColor: COLOR.paper,
                borderTopLeftRadius: 32, borderTopRightRadius: 32,
                height, paddingHorizontal: 24, paddingTop: 12,
              }, animatedStyle]}>
                <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: COLOR.hairline2, alignSelf: 'center', marginBottom: 16 }} />
                {children}
              </Animated.View>
            </GestureDetector>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
