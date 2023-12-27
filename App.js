import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [socket, setSocket] = useState(null);
  const [barcode, setBarcode] = useState(null);

 // Define the WebSocket server URL
 const serverUrl = 'ws:////192.168.1.2:3001';

 useEffect(() => {
  console.log(scanned);
 },[scanned])

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();

    // webSocket 
    const newSocket = new WebSocket(serverUrl);

    newSocket.addEventListener('open', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.addEventListener('message', (event) => {
      // Handle incoming messages
      try {
        const response = JSON.parse(event.data)
        if (response.type === 'message') {
          console.log(response);
        } else if (response.type === 'itemData' && response.data) {
          console.log('Data From backend ');
        }
      } catch (error) {
        console.log('Error parsing data: ', error);
      }
    });

    newSocket.addEventListener('close', () => {
      console.log('Disconnected from WebSocket server');
    });

    newSocket.addEventListener('error', (ev) => {
      console.log('Error :', ev);
    })

    setSocket(newSocket);

    return () => {
      console.log("Close by frontend");
      newSocket.close();
    };
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    console.log(type, data);
    setScanned(true);
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    console.log(data);
    setBarcode(data)
    // sendScanData(data)
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const sendScanData = () => {
    if(socket && barcode){
      const req = {
        request: 'getItemData',
        code: barcode
      }
      socket?.send(JSON.stringify(req))
    }
  }

  const handleSend = () =>{
    console.log('clic');
  }


  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
      </View>

      <View style={styles.sendButtonContainer}>
      <Text style={styles.sendText}>{barcode}</Text> 
        <Button disabled={!barcode} title={'Send'} onPress={() => sendScanData()} />
      </View>

    </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     justifyContent: 'center',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  cameraContainer: {
    flex: 0.8,
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  sendButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 70,
  },
  sendText: {
    marginHorizontal: 'auto',
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 16,
  },
});
