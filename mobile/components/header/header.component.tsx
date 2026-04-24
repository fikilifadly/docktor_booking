import { View, Text } from "react-native";
import config from "./header.config";

const Header = () => {
  return (
    <View className="flex-1 bg-white">
      <Text> Hello </Text>
    </View>
  );
};

Header.displayName = config.displayName;
export default Header;