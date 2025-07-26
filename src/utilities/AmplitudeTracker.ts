import * as amplitude from '@amplitude/analytics-browser'
import * as sessionReplay from "@amplitude/session-replay-browser";
import { Experiment, ExperimentClient } from '@amplitude/experiment-js-client';
import { AMPLITUDE_API_KEY, IS_DEBUG } from '@/config/AppConfig.ts'

let singleton = null

export default class AmplitudeTracker {
  experiment: ExperimentClient

  static getInstance() {
    if (singleton) return singleton
    singleton = new AmplitudeTracker()
    return singleton
  }

  constructor() {
    if (IS_DEBUG) return
    
    amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: true
    })
    this.experiment = Experiment.initializeWithAmplitudeAnalytics(AMPLITUDE_API_KEY)

    Promise.all([
      this.experiment.fetch(),
      amplitude.getDeviceId(),
      amplitude.getSessionId()
    ]).then(([experiment, deviceId, sessionId]) => {
      sessionReplay.init(AMPLITUDE_API_KEY, {
        deviceId,
        sessionId,
        sampleRate: 100
      });
    })
  }


  track(event: string, properties: Record<string, any>) {
    if (IS_DEBUG) return console.log('track', event, properties)

    const sessionReplayProperties = sessionReplay.getSessionReplayProperties();
    amplitude.track(event, {...properties, ...sessionReplayProperties})
  }

  getVariant(flag: string) {
    if (IS_DEBUG) return 'on'

    return this.experiment.variant(flag)
  }

}