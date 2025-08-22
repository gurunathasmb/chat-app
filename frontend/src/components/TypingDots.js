import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export default function TypingDots() {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  const sequence = (anim, delay) =>
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true })
    ])).start();

  useEffect(() => {
    sequence(a1, 0);
    sequence(a2, 150);
    sequence(a3, 300);
  }, []);

  const Dot = ({ a }) => (
    <Animated.View style={{
      width: 6, height: 6, borderRadius: 3, marginHorizontal: 2,
      backgroundColor: '#90a4ae', opacity: a
    }}/>
  );

  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Dot a={a1} /><Dot a={a2} /><Dot a={a3} />
  </View>;
}
