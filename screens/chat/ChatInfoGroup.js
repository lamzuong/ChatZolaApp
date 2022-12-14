import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  Pressable,
  StatusBar,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  BackHandler,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import styles from "./style/styleChatInfoGroup";
import { AuthContext } from "../../context/AuthContext";
import axiosCilent from "../../api/axiosClient";
import { Checkbox } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { io } from "socket.io-client";
import apiConfig from "../../api/apiConfig";

const socket = io.connect(apiConfig.baseUrl, {
  transports: ["websocket"],
});
export default function ChatInfoGroup({ navigation, route }) {
  const { name, ava, conversation, tempRender, rerenderTemp } = route.params;
  const { user } = useContext(AuthContext);
  const [modalVisibleAdd, setModalVisibleAdd] = useState(false);
  const [modalVisibleImg, setModalVisibleImg] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [conversationRender, setConversationRerender] = useState(conversation);
  const [nameRender, setNameRerender] = useState(name);
  const [nameTemp, setNameTemp] = useState(nameRender);
  const [avaRender, setAvaRerender] = useState(ava);
  const [editName, setEditName] = useState(false);
  const [listAdd, setListAdd] = useState(
    user.friends.filter((x) => !conversation?.members.includes(x))
  );
  const [listImg, setListImg] = useState([]);
  const [listFile, setListFile] = useState([]);
  // console.log(listImg);
  useEffect(() => {
    if (route.params.tempRender != null) {
      setRerender(tempRender);
    }
  });
  useEffect(() => {
    socket.off();
    socket.on("server-send-to-client", (data) => {
      let conversationIDChat;
      try {
        conversationIDChat = conversation.id;
        if (
          data.conversationID == conversationIDChat &&
          data.senderId != user.id
        ) {
          setRerender(!rerender);
        }
      } catch (error) {}
    });
    socket.on("server-send-to-authorized", (data) => {
      try {
        console.log(data);
        if (
          data.members.includes(user.id) ||
          data.conversationID === conversationRender.id
        ) {
          setRerender(!rerender);
        }
      } catch (error) {}
    });
    socket.on("server-send-to-edit", (data) => {
      try {
        if (data.members.includes(user.id)) {
          setRerender(!rerender);
        }
      } catch (error) {}
    });
  });
  const [listMem, setListMem] = useState([]);
  var list = [];
  useEffect(() => {
    if (listAdd != 0) {
      var i = 0;
      const getInfoFriends = async (mem) => {
        try {
          const res = await axiosCilent.get("/zola/users/" + mem);
          list.push(res);
          ++i;
          if (i === listAdd.length) {
            const arrSort = list.sort((a, b) =>
              a.fullName > b.fullName ? 1 : -1
            );
            setListMem(arrSort);
            i = 0;
          }
        } catch (error) {
          console.log(error);
        }
      };
      listAdd.forEach((element) => {
        getInfoFriends(element);
      });
    } else {
      setListMem([]);
    }
  }, [conversationRender.members, listAdd]);
  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await axiosCilent.get(
          "/zola/conversation/idCon/" + conversation.id
        );
        // console.log(res.members.length);
        setConversationRerender(res);
        setAvaRerender(res.avatarGroup);
        setNameRerender(res.groupName);
        setListAdd(user.friends.filter((x) => !res.members.includes(x)));
        var listI = [];
        var listF = [];
        res.images.forEach((e) => {
          var type = e.split(".").slice(-1);
          if (
            type == "png" ||
            type == "jpg" ||
            type == "jpeg" ||
            type == "jfif" ||
            type == "gif" ||
            type == "mp4"
          ) {
            listI.push(e);
          } else listF.push(e);
        });
        setListImg(listI);
        setListFile(listF);
      } catch (error) {
        console.log(error);
      }
    };
    getConversation();
  }, [rerender, conversation]);
  //========Button Back====
  useEffect(() => {
    const backAction = () => {
      navigation.navigate("ChatRoom", {
        nickname: nameRender,
        avatar: avaRender,
        conversation: conversationRender,
        rerenderTemp: !rerenderTemp,
      });
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [nameRender, avaRender, conversationRender]);
  const [itemChoose, setItemChoose] = useState([]);
  const isUserSelected = (user) => {
    // xem c?? id trong itemChoose kh??ng, tr??? v??? true false
    return itemChoose.some((selectedUser) => selectedUser.id === user.id);
  };
  const onUserPress = (user) => {
    if (isUserSelected(user)) {
      // remove it from selected
      // L???y nh???ng ph???n t??? kh??c user.id trong m???ng c?? s???n
      setItemChoose(
        itemChoose.filter((selectedUser) => selectedUser.id !== user.id)
      );
    } else {
      setItemChoose([...itemChoose, user]);
    }
  };
  const Friend = (props) => {
    return (
      <TouchableOpacity
        style={styles.itemMemAdd}
        onPress={() => {
          onUserPress(props.item);
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={{ uri: props.item.img }}
            style={{ height: 50, width: 50, borderRadius: 100 }}
          />
          <Text style={{ fontSize: 18, marginLeft: 10 }}>
            {props.item.fullName}
          </Text>
        </View>

        <Checkbox
          status={isUserSelected(props.item) ? "checked" : "unchecked"}
          onPress={() => {
            onUserPress(props.item);
          }}
          style={styles.styleCkb}
        />
      </TouchableOpacity>
    );
  };
  const addMember = async () => {
    try {
      var list = [];
      itemChoose.forEach((e) => {
        list.push(e.id);
      });
      var conv = {
        conversationId: conversation.id,
        user: user,
        listMember: itemChoose,
      };
      await axiosCilent.put("/zola/conversation/addMem", conv);
      setItemChoose([]);
      socket.emit("send-to-addMem", {
        idAdd: list,
        members: conversationRender.members,
        conversationID: conversation.id,
      });
      setRerender(!rerender);
    } catch (error) {}
  };
  //=======getGalleryImageCamera======
  const [imageSelected, setImageSelected] = useState("");
  const showImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
      base64: true,
    });
    if (!result.cancelled) {
      setImageSelected(result.uri);
      let imageBase64 = `data:image/jpeg;base64,${result.base64}`;
      const image = result.uri.split(".");
      const fileType = image[image.length - 1];
      try {
        await axiosCilent.put("/zola/conversation/mobile/avaGroup", {
          conversationId: conversation.id,
          avatarGroup: {
            base64: imageBase64,
            fileType: fileType,
          },
          avatarOld: avaRender,
          user: user,
        });
        var list = [];
        itemChoose.forEach((e) => {
          list.push(e.id);
        });
        socket.emit("send-to-edit", {
          conversationID: conversation.id,
          members: list,
        });
      } catch (err) {
        console.log(err);
      }
      setRerender(!rerender);
    }
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
    });
    if (!result.cancelled) {
      setImageSelected(result.uri);
      let imageBase64 = `data:image/jpeg;base64,${result.base64}`;
      const image = result.uri.split(".");
      const fileType = image[image.length - 1];
      try {
        await axiosCilent.put("/zola/conversation/mobile/avaGroup", {
          conversationId: conversation.id,
          avatarGroup: {
            base64: imageBase64,
            fileType: fileType,
          },
          avatarOld: avaRender,
          user: user,
        });
        socket.emit("send-to-edit", {
          conversationID: conversation.id,
          members: conversationRender.members,
        });
      } catch (err) {
        console.log(err);
      }
      setRerender(!rerender);
    }
  };
  //==================
  const renameGroup = async (name) => {
    try {
      await axiosCilent.put("/zola/conversation/renameGroup", {
        conversationId: conversation.id,
        groupName: name,
        user: user,
      });
      socket.emit("send-to-edit", {
        conversationID: conversation.id,
        members: conversationRender.members,
      });
    } catch (error) {}
  };
  //==================
  const outGroup = async () => {
    if (conversationRender.members.length > 1) {
      try {
        await axiosCilent.put("/zola/conversation/outGroup", {
          conversationId: conversation.id,
          user: user,
          members: conversationRender.members,
        });
        socket.emit("send-to-server", {
          conversationID: conversation.id,
        });
        navigation.navigate("Rooms", {
          conId: conversation.id + user.id,
          nameGroup: nameRender + user.id,
          avaGroup: avaRender + user.id,
        });
      } catch (error) {}
    } else {
      deleteGroup();
    }
  };
  //==================
  const deleteGroup = async () => {
    const req = {
      conversationId: conversation.id,
    };
    try {
      await axiosCilent.delete("/zola/conversation/deleteGroup", {
        data: req,
      });
      socket.emit("send-to-deleteGroup", {
        conversationID: conversation.id,
        idDelete: conversationRender.members,
        groupName: conversationRender.groupName,
      });
      navigation.navigate("Rooms", {
        conId: conversation.id + user.id,
        nameGroup: nameRender + user.id,
        avaGroup: avaRender + user.id,
      });
    } catch (error) {}
  };
  //==================
  const checkCreator = () => {
    if (conversationRender.creator == user?.id) return true;
    else return false;
  };
  //==================
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleAdd}
        onRequestClose={() => {
          setModalVisibleAdd(!modalVisibleAdd);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisibleAdd(!modalVisibleAdd);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <FlatList
                style={{ marginTop: 10 }}
                data={listMem}
                renderItem={({ item, index }) => {
                  return <Friend item={item} />;
                }}
                keyExtractor={(item, index) => "#" + index}
                key={"#"}
              />
              <View style={styles.viewBtn}>
                {itemChoose.length > 0 ? (
                  <TouchableOpacity
                    style={[
                      styles.btnAddMem,
                      { backgroundColor: "rgb(0,145,255)" },
                    ]}
                    onPress={() => {
                      addMember();
                      setModalVisibleAdd(!modalVisibleAdd);
                    }}
                  >
                    <Text style={styles.txtAddMem}>Th??m</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[styles.btnAddMem, { backgroundColor: "#ccccff" }]}
                  >
                    <Text style={styles.txtAddMem}>Th??m</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.btnAddMem}
                  onPress={() => {
                    itemChoose.length > 0
                      ? Alert.alert("Th??ng b??o", "B???n c?? mu???n h???y kh??ng?", [
                          {
                            text: "H???y",
                            onPress: () => {},
                          },
                          {
                            text: "OK",
                            onPress: () => setModalVisibleAdd(!modalVisibleAdd),
                          },
                        ])
                      : setModalVisibleAdd(!modalVisibleAdd);
                  }}
                >
                  <Text style={styles.txtAddMem}>H???y</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={modalVisibleImg}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisibleImg(!modalVisibleImg);
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { width: "65%" }]}>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  showImagePicker();
                  setModalVisibleImg(!modalVisibleImg);
                }}
              >
                <View styles={{ width: "100%" }}>
                  <FontAwesome
                    name="image"
                    size={25}
                    color="black"
                    style={{ margin: 10, marginTop: 12 }}
                  />
                </View>
                <View styles={{ width: "100%" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      paddingVertical: 10,
                    }}
                  >
                    Ch???n ???nh t??? th?? vi???n
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row" }}
                onPress={() => {
                  openCamera();
                  setModalVisibleImg(!modalVisibleImg);
                }}
              >
                <View styles={{ width: "100%" }}>
                  <AntDesign
                    name="camera"
                    size={25}
                    color="black"
                    style={{ margin: 10, marginTop: 12 }}
                  />
                </View>
                <View styles={{ width: "100%" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      paddingVertical: 10,
                    }}
                  >
                    Ch???p ???nh
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBack}
          onPress={() => {
            navigation.navigate("ChatRoom", {
              nickname: nameRender,
              avatar: avaRender,
              conversation: conversationRender,
              rerenderTemp: !rerenderTemp,
            });
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
            T??y ch???n
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Image source={{ uri: avaRender }} style={styles.imgAva} />
        {editName ? (
          <View>
            <TextInput
              style={[styles.txtNameGr, { textAlign: "center" }]}
              value={nameTemp}
              onChangeText={(text) => setNameTemp(text)}
              selectTextOnFocus={true}
              autoFocus={true}
            />
            <View style={styles.viewBtnRename}>
              <TouchableOpacity
                style={[{ backgroundColor: "blue" }, styles.btnRename]}
                onPress={() => {
                  setNameRerender(nameTemp);
                  setEditName(false);
                  renameGroup(nameTemp);
                }}
              >
                <Text style={styles.txtRename}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[{ backgroundColor: "red" }, styles.btnRename]}
                onPress={() => {
                  setNameRerender(nameRender);
                  setNameTemp(nameRender);
                  setEditName(false);
                }}
              >
                <Text style={styles.txtRename}>H???y</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.txtNameGr}>{nameRender}</Text>
        )}
      </View>
      <View style={styles.viewOption}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            setModalVisibleAdd(!modalVisibleAdd);
          }}
        >
          <View style={styles.iconOption}>
            <AntDesign name="addusergroup" size={24} color="black" />
          </View>
          <Text style={{ textAlign: "center" }}>Th??m{"\n"}th??nh vi??n</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => setEditName(true)}
        >
          <View style={styles.iconOption}>
            <AntDesign name="edit" size={24} color="black" />
          </View>
          <Text style={{ textAlign: "center" }}>Ch???nh s???a{"\n"}t??n nh??m</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            setModalVisibleImg(!modalVisibleImg);
          }}
        >
          <View style={styles.iconOption}>
            <MaterialCommunityIcons
              name="image-edit-outline"
              size={24}
              color="black"
            />
          </View>
          <Text style={{ textAlign: "center" }}>Ch???nh s???a{"\n"}???nh nh??m</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 10 }}>
        <TouchableOpacity
          style={styles.btnInfoGr}
          onPress={() => {
            navigation.navigate("ListMemberGroup", {
              conversation: conversationRender,
              name: nameRender,
              ava: avaRender,
              rerender: rerender,
            });
          }}
        >
          <Ionicons name="people" size={30} color="black" />
          <View style={styles.borderBot}>
            <Text style={styles.txtInfoGr}>Th??nh vi??n nh??m</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnInfoGr}
          onPress={() => {
            navigation.navigate("FileMediaGroup", {
              listFile: listFile,
              listImg: listImg,
            });
          }}
        >
          <FontAwesome name="image" size={28} color="black" />
          <View style={styles.borderBot}>
            <Text style={styles.txtInfoGr}>???nh/Video, File</Text>
          </View>
        </TouchableOpacity>
        {conversationRender.creator == user?.id &&
        conversationRender.members.length > 1 ? (
          <TouchableOpacity
            style={styles.btnInfoGr}
            onPress={() => {
              navigation.navigate("ListMemberGrant", {
                conversation: conversationRender,
                name: nameRender,
                ava: avaRender,
                rerender: rerender,
              });
            }}
          >
            <Entypo name="cycle" size={28} color="black" />
            <View style={styles.borderBot}>
              <Text style={styles.txtInfoGr}>???y quy???n</Text>
            </View>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={styles.btnInfoGr}
          onPress={() => {
            checkCreator()
              ? conversationRender.members.length > 1
                ? Alert.alert(
                    "Th??ng b??o",
                    "B???n l?? tr?????ng nh??m n??n ph???i ???y quy???n cho ng?????i kh??c m???i ???????c r???i kh???i nh??m",
                    [
                      {},
                      {
                        text: "OK",
                        onPress: () =>
                          navigation.navigate("ListMemberGrant", {
                            conversation: conversationRender,
                            name: nameRender,
                            ava: avaRender,
                            rerender: rerender,
                            wantOut: true,
                          }),
                      },
                    ]
                  )
                : Alert.alert(
                    "C???nh b??o",
                    "B???n c?? ch???c mu???n r???i kh???i nh??m kh??ng?",
                    [
                      {
                        text: "H???y",
                        onPress: () => {},
                      },
                      { text: "OK", onPress: () => outGroup() },
                    ]
                  )
              : Alert.alert(
                  "C???nh b??o",
                  "B???n c?? ch???c mu???n r???i kh???i nh??m kh??ng?",
                  [
                    {
                      text: "H???y",
                      onPress: () => {},
                    },
                    { text: "OK", onPress: () => outGroup() },
                  ]
                );
          }}
        >
          <Entypo name="log-out" size={30} color="red" />
          <View style={styles.borderBot}>
            <Text style={[styles.txtInfoGr, { color: "red" }]}>
              R???i kh???i nh??m
            </Text>
          </View>
        </TouchableOpacity>
        {conversationRender.creator == user?.id ? (
          <TouchableOpacity
            style={styles.btnInfoGr}
            onPress={() => {
              Alert.alert("C???nh b??o", "B???n c?? ch???c mu???n gi???i t??n nh??m kh??ng?", [
                {
                  text: "H???y",
                  onPress: () => {},
                },
                { text: "OK", onPress: () => deleteGroup() },
              ]);
            }}
          >
            <AntDesign name="delete" size={30} color="red" />
            <View style={styles.borderBot}>
              <Text style={[styles.txtInfoGr, { color: "red" }]}>
                Gi???i t??n nh??m
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
