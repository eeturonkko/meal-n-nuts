import { Svg, Circle, Line, Text as SvgText } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import React from "react";

const AnimatedProgressCircle = Animated.createAnimatedComponent(Circle);

type NutrientProgressCircleProps = {
  progressValue: number;
  goalValue: number;
  label: string;
  size: number;
};

export const NutrientProgressCircle = ({
  progressValue,
  goalValue,
  label,
  size,
}: NutrientProgressCircleProps) => {
  const r = 45;
  const circleLength = 2 * Math.PI * r;
  const visibleLength = 200;
  const animatedProgressBar = useSharedValue(0);

  React.useEffect(() => {
    animatedProgressBar.value = withTiming(progressValue / goalValue, {
      duration: 2000,
    });
  }, [progressValue, goalValue]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: Math.min(
      200,
      Math.max(0, visibleLength * (1 - animatedProgressBar.value))
    ),
  }));

  return (
    <Svg height={size} width={size} viewBox="0 0 100 100">
      <Circle
        cx="50"
        cy="50"
        r={r}
        stroke="#cacacaff"
        strokeWidth="8"
        strokeDasharray={`${visibleLength}, ${circleLength}`}
        transform="rotate(143, 50, 50)"
        fill="transparent"
        strokeLinecap="round"
      />

      <AnimatedProgressCircle
        cx="50"
        cy="50"
        r={r}
        stroke="#16a34a"
        strokeWidth="8"
        strokeDasharray={`${visibleLength}, ${circleLength}`}
        animatedProps={animatedProps}
        transform="rotate(143, 50, 50)"
        fill="transparent"
        strokeLinecap="round"
      />

      <SvgText x="50" y="44" fill="#000" fontSize="20" textAnchor="middle">
        {progressValue}
      </SvgText>

      <Line x1="25" y1="50" x2="75" y2="50" stroke="black" />

      <SvgText x="50" y="68" fill="#585858ff" fontSize="15" textAnchor="middle">
        {goalValue}
      </SvgText>

      <SvgText x="50" y="90" fill="#000" fontSize="12" textAnchor="middle">
        {label}
      </SvgText>
    </Svg>
  );
};
