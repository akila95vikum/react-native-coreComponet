import { Text, View } from "react-native";
import ProductScanRNCamera from "./ProductScanRNCamera";

export default function Greet({ name }) {
    return (
        <View>
            <Text>
                {name}  Welcome back!
            </Text>
            <ProductScanRNCamera />
        </View>
    )
}