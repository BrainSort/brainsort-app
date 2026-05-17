module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|d3|d3-scale|d3-interpolate|d3-array|internmap|d3-color|d3-time|d3-time-format)"
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
};
