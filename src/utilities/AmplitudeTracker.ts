import * as amplitude from '@amplitude/analytics-browser'
import * as sessionReplay from "@amplitude/session-replay-browser";
import { Experiment, ExperimentClient } from '@amplitude/experiment-js-client';
import { AMPLITUDE_API_KEY, IS_DEBUG } from '@/config/AppConfig.ts'

let ExperimentInstance: ExperimentClient | null = null
let isInitialized = false

export default class AmplitudeTracker {

  static init = async () => {
    return new Promise((resolve, reject) => {
      if (IS_DEBUG) {
        resolve({ deviceId: 'debugId', sessionId: 'debugSessionId' })
      } else if (isInitialized) {
        resolve(getUserInfo())
      } else {
        this.setupAmplitude(resolve, reject)
      }
    })
  }

  static setupAmplitude = (resolve, reject) => {
    amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: true
    }).promise.then((res) => {
      ExperimentInstance = Experiment.initializeWithAmplitudeAnalytics(AMPLITUDE_API_KEY)
      Promise.all([
        ExperimentInstance.fetch(),
        amplitude.getDeviceId(),
        amplitude.getSessionId()
      ]).then(([experiment, deviceId, sessionId]) => {
        sessionReplay.init(AMPLITUDE_API_KEY, {
          deviceId: deviceId,
          sessionId: sessionId,
          sampleRate: 100
        });
        isInitialized = true
        resolve({ deviceId, sessionId })
      })
    }).catch((err) => {
      console.error('amplitude.init()', err)
      reject(err)
    })
  }
}

export const getUserInfo = () => {
  return {
    deviceId: amplitude.getDeviceId(),
    sessionId: amplitude.getSessionId()
  }
}

export const track = async (event: string, properties: Record<string, any>) => {
  if (IS_DEBUG) return console.log('track', event, properties)

  await AmplitudeTracker.init()
  const sessionReplayProperties = sessionReplay.getSessionReplayProperties();
  amplitude.track(event, {...properties, ...sessionReplayProperties})
}

export const getVariant = async (flag: string) => {
  if (IS_DEBUG) {
    console.log(`getVariant(${flag}):`, 'on')
    return 'on'
  }

  await AmplitudeTracker.init()
  return ExperimentInstance.variant(flag)
}