/*
 * Copyright (c) 2011-2022, Zingaya, Inc. All rights reserved.
 */

import React, {useEffect, useState} from 'react';
import {View, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import CustomInput from '../../Components/CustomInput';
import CustomButton from '../../Components/CustomButton';
import MainHeader from '../../Components/MainHeader';
import AdaptiveKeyboardView from '../../Components/AdaptiveKeyboardView';

import {IScreenProps} from '../../Utils/types';
import {COLORS} from '../../Utils/constants';
import {useUtils} from '../../Utils/useUtils';
import {
  changeCallState,
  toggleSendVideo,
  setError,
} from '../../Core/Store/conference/actions';
import {clearErrors} from '../../Core/Store/global/actions';
import {RootReducer} from '../../Core/Store';

import styles from './styles';

const MainScreen = ({navigation}: IScreenProps<'Main'>) => {
  const dispatch = useDispatch();
  const error = useSelector(
    (store: RootReducer) => store.conferenceReducer.error,
  );
  const {
    isIOS,
    isAndroid,
    checkAndroidMicrophonePermission,
    checkAndroidCameraPermission,
  } = useUtils();

  const [conference, setConference] = useState('');

  useEffect(() => {
    error && dispatch(clearErrors());
  }, [conference]);

  const startConference = async (withVideo?: boolean) => {
    if (!conference) {
      dispatch(setError('Room cannot be empty'));
      return;
    }
    if (withVideo) {
      dispatch(toggleSendVideo());
    }
    let resultAudio;
    let resultVideo;
    if (isAndroid) {
      try {
        resultAudio = await checkAndroidMicrophonePermission();
        if (withVideo) {
          resultVideo = await checkAndroidCameraPermission();
          !resultVideo && dispatch(toggleSendVideo());
        }
      } catch (_) {
        console.warn('Something was wrong with android permissions...');
      }
    }
    if (resultAudio || isIOS) {
      dispatch(changeCallState('Connecting...'));
      navigation.navigate('Conference', {conference});
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={'light-content'} backgroundColor={COLORS.PRIMARY} />
      <MainHeader />
      <View style={styles.contentWrapper}>
        <AdaptiveKeyboardView>
          <CustomInput
            title={'Conference name'}
            value={conference}
            placeholder={'Type conference name here'}
            setValue={setConference}
            validationText={error}
          />
          <View style={styles.settingsWrapper}>
            <CustomButton
              title={'Join with audio'}
              onPress={() => startConference()}
              styleFromProps={{wrapper: styles.startConferenceButtonWrapper}}
            />
            <CustomButton
              title={'Join with video'}
              onPress={() => startConference(true)}
              styleFromProps={{wrapper: styles.startConferenceButtonWrapper}}
            />
          </View>
        </AdaptiveKeyboardView>
      </View>
    </SafeAreaView>
  );
};

export default MainScreen;
