import React from 'react';
import Animated, {
  Keyframe,
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';

import { Container, IconWrapper, Label, Wrapper } from './styles';

export type PlayerProps = {
  id: number;
  name: string;
  length: number;
  scroll: SharedValue<number>;
  scrollRef: React.RefObject<Animated.ScrollView>;
  scrollHeight: SharedValue<number>;
  active: SharedValue<number>;
  positions: SharedValue<Record<number, number>>;
  onPress: () => void;
  onSwap: (target: number) => void;
};

const AnimatedIcon = Animated.createAnimatedComponent(Icon);

export const Player = ({
  id,
  name,
  length,
  scroll,
  scrollRef,
  scrollHeight,
  active,
  positions,
  onPress,
  onSwap,
}: PlayerProps) => {
  const index = positions.value[id];

  const position = useSharedValue(positions.value[id] * 84 || 0);
  const initial = useSharedValue(position.value);
  const lastActive = useSharedValue(false);
  const inView = useSharedValue(false);

  const exiting = new Keyframe({
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0,
    },
  }).duration(200);

  useAnimatedReaction(
    () => active.value,
    value => {
      if (value === id) {
        lastActive.value = true;
      } else if (value !== -1) {
        lastActive.value = false;
      }
    }
  );

  useAnimatedReaction(
    () => positions.value[id],
    value => {
      if (active.value !== id) {
        position.value = withSpring(value * 84);
      }
    }
  );

  const drag = Gesture.Pan()
    .onBegin(() => {
      active.value = id;

      initial.value = position.value;

      inView.value = false;
    })
    .onUpdate(e => {
      const y = e.translationY + initial.value;

      const overflow = scrollHeight.value < length * 84;

      const min = overflow ? scroll.value : 0;

      const max =
        (overflow ? scroll.value + scrollHeight.value : scrollHeight.value) -
        84;

      if (y < 0) {
        position.value = 0;

        return;
      }

      if (y + 84 > Math.max(scrollHeight.value, length * 84)) {
        position.value = Math.max(scrollHeight.value, length * 84) - 84;

        return;
      }

      if (y > min && y < max) {
        inView.value = true;
      } else if (y <= min && inView.value) {
        scrollTo(scrollRef, 0, scroll.value - (min - y), true);
      } else if (y >= max && inView.value) {
        scrollTo(scrollRef, 0, scroll.value + (y - max), true);
      }

      const newIndex = Math.round(y / 84);

      if (newIndex !== positions.value[id]) {
        runOnJS(onSwap)(newIndex);
      }

      position.value = y;
    })
    .onEnd(() => {
      position.value = withSpring(84 * positions.value[id]);
    })
    .onFinalize(() => {
      active.value = -1;
    });

  const dragStyle = useAnimatedStyle(() => ({
    top: position.value,
    zIndex: lastActive.value ? length : positions.value[id],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    color: active.value === id ? 'blue' : 'gray',
  }));

  return (
    <Container index={index} style={dragStyle}>
      <Wrapper rippleColor="#9994" exiting={exiting} onPress={onPress}>
        <Label>{name}</Label>
        <GestureDetector gesture={drag}>
          <IconWrapper>
            <AnimatedIcon name="menu" size={22} style={iconStyle} />
          </IconWrapper>
        </GestureDetector>
      </Wrapper>
    </Container>
  );
};
