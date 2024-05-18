export type ColorType =
  | typeof white
  | typeof black
  | typeof themeLight
  | typeof theme
  | typeof unactive
  | typeof attention
  | typeof warning
  | typeof darkBlue
  | typeof calmBlue
  | typeof cleanBlue
  | typeof green
  | typeof neutral247
  | typeof neutral245
  | typeof neutral229
  | typeof neutral204
  | typeof neutral170
  | typeof neutral153
  | typeof neutral136
  | typeof neutral102
  | typeof neutral51
  | typeof normalFont
  | typeof border
  | typeof bg
  | typeof bgLightGray
  | typeof anchor
  | typeof shadow
  | typeof tooltipBg
  | typeof scrollBar
  | typeof scrollBarHover
  | typeof transparent;

export type ChartColorType = typeof chart1 | typeof chart2 | typeof chart3 | typeof chart4 | typeof chart5 | typeof chart6 | typeof chart7;

export type SignupColorType = typeof signupDarkBlue | typeof signupGray;

// general colors.
export const white = 'white';
export const black = 'black';

// theme colors.
export const themeLight = 'themeLight';
export const theme = 'theme';
export const unactive = 'unactive';

// intention colors.
export const attention = 'attention';
export const warning = 'warning';

// variation colors.
export const darkBlue = 'darkBlue'; // タイトル・メニューなど
export const calmBlue = 'calmBlue';
export const cleanBlue = 'cleanBlue';
export const green = 'green';

// neutral colors.
export const neutral247 = 'neutral247'; // テーブル・メニューの着色背景など
export const neutral245 = 'neutral245'; // フォーム部品の非活性背景など
export const neutral229 = 'neutral229'; // 通常線など
export const neutral204 = 'neutral204'; // フォーム部品の枠線など
export const neutral170 = 'neutral170'; // フォーム部品のdisableなど
export const neutral153 = 'neutral153'; // フッターなど
export const neutral136 = 'neutral136'; // Closeなど
export const neutral102 = 'neutral102';
export const neutral51 = 'neutral51'; // 通常フォント
export const neutral32 = 'neutral32';

// general colors.
export const normalFont = 'normalFont'; // 通常フォント
export const border = 'border'; // 通常線など
export const bg = 'bg';
export const bgLightGray = 'bgLightGray';
export const anchor = 'anchor';
export const shadow = 'shadow';
export const tooltipBg = 'tooltipBg';
export const transparent = 'transparent';

// chart colors.
export const chart1 = 'chart1';
export const chart2 = 'chart2';
export const chart3 = 'chart3';
export const chart4 = 'chart4';
export const chart5 = 'chart5';
export const chart6 = 'chart6';
export const chart7 = 'chart7';

// scroll bar color.
export const scrollBar = 'scrollBar';
export const scrollBarHover = 'scrollBarHover';

// signup
export const signupDarkBlue = 'signupDarkBlue';
export const signupGray = 'signupGray';

// color mapping.
export const map = {
  [white]: { rgba: 'rgba(255, 255, 255, 1)' },
  [black]: { rgba: 'rgba(0, 0, 0, 1)' },
  [themeLight]: { rgba: 'rgba(99, 194, 179, 1)' },
  [theme]: { rgba: 'rgba(69, 164, 149, 1)' },
  [unactive]: { rgba: 'rgba(140, 140, 160, 1)' },
  [attention]: { rgba: 'rgba(254, 59, 31, 1)' },
  [warning]: { rgba: 'rgba(247, 142, 4, 1)' },
  [green]: { rgba: 'rgba(53, 153, 131, 1)' },
  [darkBlue]: { rgba: 'rgba(54, 64, 99, 1)' },

  [calmBlue]: { rgba: 'rgba(141, 151, 177, 1)' },
  [cleanBlue]: { rgba: 'rgba(233, 241, 252, 1)' },
  [neutral247]: { rgba: 'rgba(247, 247, 247, 1)' },
  [neutral245]: { rgba: 'rgba(245, 245, 245, 1)' },
  [neutral229]: { rgba: 'rgba(229, 229, 229, 1)' },
  [neutral204]: { rgba: 'rgba(204, 204, 204, 1)' },
  [neutral170]: { rgba: 'rgba(170, 170, 170, 1)' },
  [neutral153]: { rgba: 'rgba(153, 153, 153, 1)' },
  [neutral136]: { rgba: 'rgba(136, 136, 136, 1)' },
  [neutral102]: { rgba: 'rgba(102, 102, 102, 1)' },
  [neutral51]: { rgba: 'rgba(51, 51, 51, 1)' },
  [normalFont]: { rgba: 'rgba(51, 51, 51, 1)' },
  [border]: { rgba: 'rgba(221, 221, 221, 1)' },
  [bg]: { rgba: 'rgba(255, 255, 255, 1)' },
  [bgLightGray]: { rgba: 'rgba(247, 247, 247, 0.94)' },
  [anchor]: { rgba: 'rgba(38, 121, 226, 1)' },
  [shadow]: { rgba: 'rgba(153, 178, 255, 0.1)' },
  [tooltipBg]: { rgba: 'rgba(255, 255, 255, 0.6)' },
  [scrollBar]: { rgba: 'rgba(229, 229, 229, 1)' },
  [scrollBarHover]: { rgba: 'rgba(200, 200, 200, 0.5)' },
  [transparent]: { rgba: 'transparent' },

  [chart1]: { rgba: 'rgba(93, 47, 126, 1)' },
  [chart2]: { rgba: 'rgba(60, 122, 219, 1)' },
  [chart3]: { rgba: 'rgba(85, 185, 223, 1)' },
  [chart4]: { rgba: 'rgba(107, 229, 188, 1)' },
  [chart5]: { rgba: 'rgba(124, 208, 67, 1)' },
  [chart6]: { rgba: 'rgba(250 , 218, 81, 1)' },
  [chart7]: { rgba: 'rgba(221, 221, 221, 1)' },

  [signupDarkBlue]: { rgba: 'rgba(68, 53, 128, 1)' },
  [signupGray]: { rgba: 'rgba(125, 124, 131, 1)' },
};

export const getRgba = (colorType?: ColorType | ChartColorType | SignupColorType, defaultColorType?: ColorType) => {
  if (colorType && map[colorType]) {
    return map[colorType].rgba;
  }

  return defaultColorType ? map[defaultColorType].rgba : map[neutral51].rgba;
};

export const gradation = `linear-gradient(to left, ${getRgba(chart3)}, ${getRgba(chart2)} 70%, ${getRgba(chart1)} 100%)`;

export const chartRgbas = [
  getRgba(chart1),
  getRgba(chart2),
  getRgba(chart3),
  getRgba(chart4),
  getRgba(chart5),
  getRgba(chart6),
  getRgba(chart7),
  getRgba(darkBlue),
  getRgba(attention),
  getRgba(warning),
  getRgba(neutral51),
  getRgba(neutral102),
  getRgba(neutral153),
  getRgba(neutral204),
];
