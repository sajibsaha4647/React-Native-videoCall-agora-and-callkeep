// Import React Hooks
import React, {useRef, useState, useEffect} from 'react';
// Import user interface elements
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
// Import components for obtaining Android device permissions
import {PermissionsAndroid, Platform} from 'react-native';
import styles from './styles';
// Import Agora SDK
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
  RtcSurfaceView,
  RtcTextureView,
  VideoRenderMode,
  VideoCanvas,
  VideoViewSetupMode,
  OrientationMode,
  DegradationPreference,
  VideoMirrorModeType,
  VideoCodecType,
} from 'react-native-agora';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Style from 'agora-video-uikit-react-native/src/Style';
// Define basic information
const appId = '244f785524814cefbd0f29a683d386bf';
const setupMode = VideoViewSetupMode.VideoViewSetupReplace;

const token =
  '007eJxTYGjcMKn4zqTOTMPVc9dIdMz0NXL37lPPmdsUlLys5MnvnzUKDEYmJmnmFqamRiYWhibJqWlJKQZpRpaJZhbGKcYWZklpPz4eTGsIZGQ4yu7EysgAgSA+O0NyRmJeXmoOAwMA+SAh9A==';
const channelName = 'channel';
const uid = 0; // Local user UID, no need to modify
const user = VideoCanvas;
const VideoCallScreen = ({}) => {
  const agoraEngineRef = useRef(); // IRtcEngine instance
  // Whether the local user has joined the channel
  const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
  const [showing, setIsshowing] = useState(true); // Whether the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Remote user UID
  const [message, setMessage] = useState(''); // User prompt message
  const [peerIds, setPeerIds] = useState([]);

  // Initialize the engine when starting the App
  useEffect(() => {
    setupVideoSDKEngine();
  });
  const setupVideoSDKEngine = async () => {
    try {
      // Create RtcEngine after checking and obtaining device permissions
      // if (Platform.OS === 'android') {
      //   await getPermission();
      // }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      // Register event callbacks
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel: ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has joined');
          setRemoteUid(Uid);
          if (peerIds.length == 0) {
            setPeerIds([Uid]);
          }

          // if (peerIds.indexOf(Uid) === -1) {
          //   // Add peer ID to state array

          // }
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user ' + Uid + ' has left the channel');
          setRemoteUid(0);
        },
      });

      agoraEngineRef.current.setVideoEncoderConfiguration({
        // Set the video codec type to H.264
        codecType: VideoCodecType.VideoCodecH264,
        // Set the video encoding resolution to 640 x 360 pixels
        dimensions: {
          width: 640,
          height: 360,
        },
        // Set the frame rate
        frameRate: 15,
        // Set the bitrate mode to StandardBitrate
        bitrate: 0,
        // Set the minimum encoding bitrate to 1 Kbps
        minBitrate: -1,
        // Set the rotation mode to Adaptive
        orientationMode: OrientationMode.OrientationModeFixedPortrait,
        // Set the degradation preference to MaintainQuality
        degradationPreference: DegradationPreference.MaintainQuality,
        // Disable mirroring mode when sending encoded video
        mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
      });

      // Initialize the engine
      agoraEngine.initialize({
        appId: appId,
      });

      agoraEngineRef.current?.startPreview();
      agoraEngine.enableVideo();
    } catch (e) {
      console.log(e);
    }
  };
  // Define the join method called after clicking the join channel button
  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      // Set the channel profile type to ChannelProfileCommunication after joining the channel
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      // Call the joinChannel method to join the channel
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        // Set the user role to broadcaster
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      console.log('join channel', ClientRoleType.ClientRoleBroadcaster);
      console.log(
        'join channel',
        ChannelProfileType.ChannelProfileCommunication,
      );
    } catch (e) {
      console.log(e);
    }
  };
  // Define the leave method called after clicking the leave channel button
  const leave = () => {
    try {
      // Call the leaveChannel method to leave the channel
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('Left the channel');
      setPeerIds([]);
    } catch (e) {
      console.log(e);
    }
  };

  const _renderRemoteVideos = () => {
    return (
      <View
        style={styles.remoteContainer}
        contentContainerStyle={styles.padding}
        horizontal={true}>
        {peerIds.map((data, id) => {
          return (
            <RtcSurfaceView
              style={styles.remote}
              canvas={{
                uid: data,
              }}
              key={id}
            />
          );
        })}
      </View>
    );
  };
  // Render the user interface
  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.head}>Agora Voice Call Quick Start</Text>

      <View style={styles.btnContainer}>
        <Text onPress={join} style={styles.button}>
          Join Channel
        </Text>
        <Text onPress={leave} style={styles.button}>
          Leave Channel
        </Text>
      </View>

      {isJoined ? (
        <View style={[styles.fullView, {position: 'relative'}]}>
          <RtcSurfaceView
            style={styles.max}
            canvas={{
              uid: 0,
              setupMode,
            }}
          />

          {_renderRemoteVideos()}
          <View style={styles.buttonBar}>
            <Icon
              style={styles.iconStyle}
              backgroundColor="#0093E9"
              name={true ? 'mic-off' : 'mic'}
              onPress={() => {}}
            />
            <Icon
              style={styles.iconStyle}
              backgroundColor="red"
              name="call-end"
              onPress={leave}
            />
            <Icon
              style={styles.iconStyle}
              backgroundColor="#0093E9"
              name={true ? 'videocam-off' : 'videocam'}
              onPress={() => {}}
            />
          </View>
        </View>
      ) : null}
      {/* <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}>
        {isJoined ? (
          <Text>Local user UID: {uid}</Text>
        ) : (
          <Text>Join a channel</Text>
        )}
        <View style={{height: 300, width: 300}}>
          <RtcSurfaceView
            // style={user.uid === 0 ? AgoraStyle.videoLarge : AgoraStyle.videoSmall}
            // zOrderMediaOverlay={remoteUid == 0}
            canvas={{uid: uid, setupMode}}
            uid={0}
          />
          <Text>here local user</Text>
        </View>
        {isJoined && remoteUid !== 0 ? (
          // <Text>Remote user UID: {remoteUid}</Text>
          <View style={{flexDirection: 'column', height: 500}}>
            <Text>Remote user UID: {remoteUid}</Text>
            <View style={{height: 300, width: 300}}>
              <RtcSurfaceView
                // style={user.uid === 0 ? AgoraStyle.videoLarge : AgoraStyle.videoSmall}
                // zOrderMediaOverlay={remoteUid !== 0}
                canvas={{uid: remoteUid, setupMode}}
                uid={remoteUid}
              />
            </View>
          </View>
        ) : (
          <Text>Waiting for remote users to join</Text>
        )}
        <Text>{message}</Text>
      </ScrollView> */}
    </SafeAreaView>
  );
  // Display message
  function showMessage(msg) {
    setMessage(msg);
  }
};

// Define user interface styles

// const getPermission = async () => {
//   if (Platform.OS === 'android') {
//     await PermissionsAndroid.requestMultiple([
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//     ]);
//   }
// };
export default VideoCallScreen;
// ===========
