import { Dimensions, StyleSheet } from "react-native";
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    width: "100%",
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: "rgb(0,145,255)",
    flexDirection: "row",
  },
  imgAva: {
    height: 120,
    width: 120,
    borderRadius: 100,
  },
  viewTab: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  tabNoSelect: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    fontWeight: "bold",
    fontSize: 16,
  },
  tabSelected: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    fontWeight: "bold",
    fontSize: 16,
  },
  imageItem: {
    height: Dimensions.get("window").width / 3,
    width: Dimensions.get("window").width / 3,
  },
  fileItem: {
    padding: 20,
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  fileName: {
    fontSize: 17,
    marginLeft: 10,
    maxWidth: "90%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "black",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "flex-end",
  },
  imageShow: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
    marginTop: -50,
  },
  btnCloseModal: {
    alignItems: "flex-end",
    paddingRight: 10,
    paddingTop: 10,
    zIndex: 4,
    width: 40,
    height: 40,
  },
  viewOption: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconOption: {
    width: 35,
    height: 35,
    borderRadius: 100,
    padding: 5,
    backgroundColor: "#f2f2f2",
  },
  btnInfoGr: {
    alignItems: "center",
    paddingLeft: 20,
    flexDirection: "row",
  },
  txtInfoGr: {
    fontSize: 18,
    padding: 10,
    paddingVertical: 15,
  },
  borderBot: {
    borderBottomWidth: 1,
    width: "100%",
    borderBottomColor: "rgb(230,230,230)",
    marginLeft: 20,
  },
});
export default styles;
