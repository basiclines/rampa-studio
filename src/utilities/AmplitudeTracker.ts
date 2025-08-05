import * as amplitude from '@amplitude/analytics-browser'
import * as sessionReplay from "@amplitude/session-replay-browser";
import { Experiment, ExperimentClient } from '@amplitude/experiment-js-client';
import { AMPLITUDE_API_KEY, IS_DEBUG } from '@/config/AppConfig.ts'
import { v4 as uuidv4 } from 'uuid';

let ExperimentInstance: ExperimentClient | null = null

export default class AmplitudeTracker {

  static init() {
    if (IS_DEBUG) return
    
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
      })
    }).catch((err) => {
      console.error('amplitude.init()', err)
    })
  }

  static track(event: string, properties: Record<string, any>) {
    if (IS_DEBUG) return console.log('track', event, properties)

    const sessionReplayProperties = sessionReplay.getSessionReplayProperties();
    amplitude.track(event, {...properties, ...sessionReplayProperties})
  }

  static getVariant(flag: string) {
    if (IS_DEBUG) {
      console.log(`getVariant(${flag}):`, 'on')
      return 'on'
    }

    return ExperimentInstance.variant(flag)
  }

}