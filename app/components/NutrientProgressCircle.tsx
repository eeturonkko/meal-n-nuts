import { Svg, Circle, Line, Text as SvgText } from "react-native-svg";

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
  const progressBar = progressValue / goalValue;

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
      />

      <Circle
        cx="50"
        cy="50"
        r={r}
        stroke="#16a34a"
        strokeWidth="8"
        strokeDasharray={`${visibleLength}, ${circleLength}`}
        strokeDashoffset={visibleLength * (1 - progressBar)}
        transform="rotate(143, 50, 50)"
        fill="transparent"
      />

      <SvgText x="50" y="44" fill="#000" fontSize="20" textAnchor="middle">
        {progressValue}
      </SvgText>

      <Line x1="25" y1="50" x2="75" y2="50" stroke="black" />

      <SvgText x="50" y="68" fill="#585858ff" fontSize="15" textAnchor="middle">
        {goalValue}
      </SvgText>

      <SvgText x="50" y="90" fill="#000" fontSize="13" textAnchor="middle">
        {label}
      </SvgText>
    </Svg>
  );
};
