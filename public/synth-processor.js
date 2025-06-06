class SynthProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.sampleRate = sampleRate; // sampleRate is global in AudioWorkletProcessor

    this.ready = false;
    this.phase = 0;

    // Receive wasm bytes from main thread
    const wasmBytes = options.processorOptions.wasmBytes;

    // Instantiate WASM module synchronously here (WebAssembly.instantiateSync)
    WebAssembly.instantiate(wasmBytes, {/* imports */ }).then(wasm => {
      this.wasmInstance = wasm.instance;
      this.exports = wasm.instance.exports;
      // Ready to process audio
    });

    this.port.onmessage = this.handleMessage.bind(this);

    this.ready = true;
  }


  handleMessage(event) {
    if (!this.ready) return;

    const data = event.data;
    if (data.type === 'noteOn') {
      // Call WASM noteOn(freq, current_time)
      this.exports.noteOn(data.frequency, data.currentTime);
    } else if (data.type === 'noteOff') {
      this.exports.noteOff(data.currentTime);
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.ready) return true;

    const output = outputs[0];
    const channel = output[0];

    for (let i = 0; i < channel.length; i++) {
      // Call WASM renderSample(current_time)
      // current_time in seconds = current frame index / sampleRate + currentTime offset
      // We approximate currentTime here as current frame index / sampleRate
      const currentTime = currentFrame / this.sampleRate + i / this.sampleRate;

      // WASM renderSample expects currentTime as float
      const sample = this.exports.renderSample(currentTime);

      channel[i] = sample;
    }

    return true;
  }
}

registerProcessor('synth-processor', SynthProcessor);

