import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Image,
  ScrollView,
  BackHandler,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import styles from "./style/styleFileMediaGroup";
import { Video, AVPlaybackStatus } from "expo-av";

export default function FileMediaGroup({ navigation, route }) {
  //======Button Back=======
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);
  //=========================
  const { listFile, listImg } = route.params;
  const [select, setSelected] = useState("image");
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBack}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="md-arrow-back-sharp" size={40} color="white" />
        </TouchableOpacity>
        <View style={{ justifyContent: "center", marginLeft: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "white",
            }}
          >
            Ảnh/Video, File
          </Text>
        </View>
      </View>
      <View style={styles.viewTab}>
        <TouchableOpacity
          onPress={() => {
            setSelected("image");
          }}
        >
          <Text
            style={select == "image" ? styles.tabSelected : styles.tabNoSelect}
          >
            Ảnh/Video
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelected("file");
          }}
        >
          <Text
            style={select == "file" ? styles.tabSelected : styles.tabNoSelect}
          >
            File
          </Text>
        </TouchableOpacity>
      </View>
      <ChooseTab name={select} listImg={listImg} listFile={listFile} />
    </View>
  );
}
function ChooseTab(props) {
  if (props.name == "image") {
    return (
      <FlatList
        data={props.listImg}
        renderItem={({ item }) => <GridView name={item} />}
        keyExtractor={(item, index) => index}
        numColumns={3}
        style={{ marginTop: 20 }}
      />
    );
  } else if (props.name == "file") {
    return (
      <ScrollView>
        <View style={{ marginTop: 10, marginBottom: 20 }}>
          {props.listFile.map((e, i) => (
            <Files key={i} name={e} />
          ))}
        </View>
      </ScrollView>
    );
  }
}
const GridView = ({ name }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showCloseBtn, setShowCloseBtn] = useState(false);
  const [status, setStatus] = useState({});
  var fileType = name.split(".").reverse()[0];
  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable
          onPress={() => {
            setShowCloseBtn(!showCloseBtn);
          }}
        >
          <View style={styles.modalView}>
            {showCloseBtn ? (
              <Pressable
                style={styles.btnCloseModal}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <MaterialIcons name="clear" size={30} color="white" />
              </Pressable>
            ) : (
              <View style={{ height: 40 }}></View>
            )}
            {fileType == "mp4" ? (
              <Video
                style={styles.imageShow}
                source={{
                  uri: name,
                }}
                useNativeControls
                resizeMode="contain"
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
              />
            ) : (
              <Image
                source={{
                  uri: name,
                }}
                style={styles.imageShow}
              />
            )}
          </View>
        </Pressable>
      </Modal>

      <Pressable
        onPress={() => {
          setModalVisible(!modalVisible);
        }}
      >
        {fileType == "mp4" ? (
          <Video
            style={styles.imageItem}
            source={{
              uri: name,
            }}
            useNativeControls
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
        ) : (
          <Image
            source={{
              uri: name,
            }}
            style={styles.imageItem}
          />
        )}
      </Pressable>
    </View>
  );
};
const Files = (props) => {
  async function downloadFile(url) {
    await Linking.openURL(url);
  }
  function convertName(name) {
    let a = name.split("-");
    let temp = "";
    for (let i = 5; i < a.length; i++)
      if (i == a.length - 1) temp += a[i];
      else temp += a[i] + "-";
    return temp;
  }
  return (
    <View>
      <TouchableOpacity
        style={styles.fileItem}
        onPress={() => {
          downloadFile(props.name);
        }}
      >
        <AntDesign name="filetext1" size={24} color="black" />
        <Text style={styles.fileName}>
          {convertName(props.name.split("/").reverse()[0])}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
